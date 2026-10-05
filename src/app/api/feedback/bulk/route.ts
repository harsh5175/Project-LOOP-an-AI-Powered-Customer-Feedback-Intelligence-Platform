import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { classifyFeedbackWithAI } from '@/lib/ai';
import { Channel, Feedback } from '@/types';

const BulkRowSchema = z.object({
  content: z.string().min(3),
  channel: z.string().optional(),
  customer_label: z.string().optional(),
  created_at: z.string().optional(),
  arr: z.union([z.number(), z.string()]).optional(),
});

const BulkPayloadSchema = z.object({
  rows: z.array(BulkRowSchema).min(1, 'At least one row must be provided for bulk upload.'),
});

export async function POST(req: NextRequest) {
  try {
    const roleCheck = requireRole(req, ['ADMIN', 'ANALYST']);
    if (roleCheck instanceof NextResponse) return roleCheck;
    const { workspaceId } = roleCheck;

    const body = await req.json();
    const validation = BulkPayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid bulk rows structure.', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { rows } = validation.data;
    const themesList = await dataStore.getThemes(workspaceId);
    const existingThemes = themesList.map((t) => t.name);

    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const importedFeedbacks: Feedback[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.content || row.content.trim().length < 3) {
          failedCount++;
          errors.push(`Row ${i + 1}: Content too short or missing.`);
          continue;
        }

        // Normalize channel
        let channel: Channel = 'SUPPORT_TICKET';
        const rawCh = (row.channel || '').toUpperCase().replace(/[\s-]/g, '_');
        if (['SUPPORT_TICKET', 'APP_STORE', 'NPS_SURVEY', 'SALES_NOTE', 'COMMUNITY'].includes(rawCh)) {
          channel = rawCh as Channel;
        }

        const classification = await classifyFeedbackWithAI(row.content, existingThemes);
        const parsedArr = typeof row.arr === 'string' ? parseFloat(row.arr.replace(/[^0-9.]/g, '')) || 15000 : row.arr || 15000;

        const newFeedback: Feedback = {
          id: `fb-bulk-${Date.now()}-${i}`,
          content: row.content,
          channel,
          sourceRef: `CSV-ROW-${i + 1}`,
          customerLabel: row.customer_label || 'Enterprise Client',
          sentiment: classification.sentiment,
          sentimentScore: classification.sentimentScore,
          status: 'NEW',
          createdAt: row.created_at || new Date().toISOString(),
          workspaceId,
          featureArea: classification.featureArea,
          rationale: classification.rationale,
          confidence: classification.confidence,
          themes: classification.themes,
          arr: parsedArr,
          customerTier: parsedArr >= 40000 ? 'Enterprise' : parsedArr >= 15000 ? 'Growth' : 'Startup',
          churnRisk: classification.sentiment === 'NEGATIVE' ? (parsedArr >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
        };

        await dataStore.addFeedback(newFeedback);
        importedFeedbacks.push(newFeedback);
        importedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Row ${i + 1}: ${err.message || 'Processing error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      failed: failedCount,
      errors: errors.slice(0, 10), // return top 10 errors
      message: `Successfully parsed and imported ${importedCount} records. ${failedCount} rows failed.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
