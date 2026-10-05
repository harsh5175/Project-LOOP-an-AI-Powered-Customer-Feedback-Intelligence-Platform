import { NextRequest, NextResponse } from 'next/server';
import { checkMongoStatus, seedMongoDbIfEmpty, maskMongoUri } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shouldSeed = url.searchParams.get('seed') === 'true';

    let seedResult = null;
    if (shouldSeed) {
      seedResult = await seedMongoDbIfEmpty();
    }

    const status = await checkMongoStatus();

    return NextResponse.json({
      success: true,
      mongodb: status,
      seedResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to inspect database status',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, uri } = body;

    if (action === 'seed') {
      const result = await seedMongoDbIfEmpty();
      const status = await checkMongoStatus();
      return NextResponse.json({
        success: result.seeded,
        message: result.message,
        counts: result.counts,
        mongodb: status,
      });
    }

    if (action === 'test' && uri) {
      const testClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });

      try {
        await testClient.connect();
        const dbs = await testClient.db().admin().listDatabases();
        await testClient.close();

        return NextResponse.json({
          success: true,
          message: 'Connection successful to MongoDB server!',
          uriMasked: maskMongoUri(uri),
          databases: dbs.databases.map((d) => d.name),
        });
      } catch (testErr: any) {
        return NextResponse.json({
          success: false,
          error: testErr.message || 'Connection test failed',
          uriMasked: maskMongoUri(uri),
        }, { status: 400 });
      }
    }

    // Default: Check current connection
    const status = await checkMongoStatus();
    return NextResponse.json({ success: true, mongodb: status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
