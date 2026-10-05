import { Feedback, Theme, User, Workspace, Report, Status } from '@/types';
import {
  SEED_FEEDBACKS,
  SEED_THEMES,
  SEED_USERS,
  SEED_WORKSPACE,
  SEED_REPORTS,
} from '@/data/seedFeedback';
import prisma from './db';
import { getMongoDb, seedMongoDbIfEmpty } from './mongodb';

// Ensure MongoDB is auto-seeded once when connected and empty
let mongoSeeded = false;
async function checkAndAutoSeedMongo() {
  if (mongoSeeded) return;
  try {
    const db = await getMongoDb();
    if (db) {
      const count = await db.collection('feedbacks').countDocuments();
      if (count === 0) {
        await seedMongoDbIfEmpty();
      }
      mongoSeeded = true;
    }
  } catch {
    // Ignore if MongoDB not yet running
  }
}

// Database-backed Store with MongoDB Primary, Prisma SQLite Secondary & In-Memory Multi-Tenant Cache & Fallback
class DataStore {
  private workspace: Workspace = { ...SEED_WORKSPACE };
  private users: User[] = [...SEED_USERS];
  private themes: Theme[] = [...SEED_THEMES];
  private feedbacks: Feedback[] = [...SEED_FEEDBACKS];
  private reports: Report[] = [...SEED_REPORTS];

  constructor() {
    // Attempt auto-seed if MongoDB is reachable
    checkAndAutoSeedMongo().catch(() => {});
  }

  // Workspace
  async getWorkspace(workspaceId: string): Promise<Workspace> {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const ws = await db.collection<Workspace>('workspaces').findOne({
          $or: [{ id: workspaceId }, { slug: workspaceId }, { tenantId: workspaceId }],
        });
        if (ws) {
          return {
            id: ws.id,
            name: ws.name,
            slug: ws.slug,
            tenantId: ws.tenantId,
            plan: ws.plan,
            createdAt: typeof ws.createdAt === 'string' ? ws.createdAt : new Date(ws.createdAt).toISOString(),
          };
        }
      }
    } catch (e) {
      console.warn('MongoDB getWorkspace fallback:', e);
    }

    // 2. Try Prisma
    try {
      const ws = await prisma.workspace.findFirst({
        where: {
          OR: [{ id: workspaceId }, { slug: workspaceId }, { tenantId: workspaceId }],
        },
      });
      if (ws) {
        return {
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          tenantId: ws.tenantId,
          plan: ws.plan,
          createdAt: ws.createdAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn('Prisma getWorkspace fallback:', e);
    }

    return this.workspace;
  }

  // Users
  async getUsers(workspaceId: string): Promise<User[]> {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const users = await db.collection<User>('users').find({
          $or: [{ workspaceId }, { workspaceId: { $exists: false } }],
        }).toArray();
        if (users && users.length > 0) {
          return users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role as any,
            avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6366f1&color=fff`,
            title: u.title || '',
          }));
        }
      }
    } catch (e) {
      console.warn('MongoDB getUsers fallback:', e);
    }

    // 2. Try Prisma
    try {
      const users = await prisma.user.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'asc' },
      });
      if (users && users.length > 0) {
        return users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as any,
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6366f1&color=fff`,
          title: u.title || '',
        }));
      }
    } catch (e) {
      console.warn('Prisma getUsers fallback:', e);
    }

    return this.users;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const u = await db.collection<User>('users').findOne({
          email: { $regex: `^${cleanEmail}$`, $options: 'i' },
        });
        if (u) {
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role as any,
            avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6366f1&color=fff`,
            title: u.title || '',
          };
        }
      }
    } catch (e) {
      console.warn('MongoDB getUserByEmail fallback:', e);
    }

    // 2. Try Prisma
    try {
      const u = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (u) {
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as any,
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6366f1&color=fff`,
          title: u.title || '',
        };
      }
    } catch (e) {
      console.warn('Prisma getUserByEmail fallback:', e);
    }

    return this.users.find((u) => u.email.toLowerCase() === cleanEmail);
  }

  async addUser(user: User): Promise<User> {
    this.users.push(user);

    // 1. Upsert into MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('users').updateOne(
          { email: user.email.toLowerCase().trim() },
          { $set: { ...user, updatedAt: new Date() } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn('MongoDB addUser fallback:', e);
    }

    // 2. Upsert into Prisma
    try {
      const ws = await prisma.workspace.findFirst();
      const wsId = (user as any).workspaceId || ws?.id || SEED_WORKSPACE.id;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role,
          title: user.title,
          avatar: user.avatar,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: 'seeded_demo_hash',
          role: user.role,
          avatar: user.avatar,
          title: user.title,
          workspaceId: wsId,
        },
      });
    } catch (e) {
      console.warn('Prisma addUser fallback:', e);
    }

    return user;
  }

  // Themes
  async getThemes(workspaceId: string): Promise<Theme[]> {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const themes = await db.collection<Theme>('themes').find({}).toArray();
        if (themes && themes.length > 0) {
          const feedbacks = await db.collection<Feedback>('feedbacks').find({}).toArray();
          return themes.map((t) => {
            const count = feedbacks.filter((f) =>
              (f.themes || []).some((name) => name.toLowerCase() === t.name.toLowerCase())
            ).length;
            return {
              id: t.id,
              name: t.name,
              description: t.description,
              color: t.color || '#6366f1',
              count: count || t.count || 0,
              changePercentage: t.changePercentage || 0,
              isSpike: (count || t.count || 0) > 25,
            };
          });
        }
      }
    } catch (e) {
      console.warn('MongoDB getThemes fallback:', e);
    }

    // 2. Try Prisma
    try {
      const themes = await prisma.theme.findMany({
        where: { workspaceId },
        include: { feedbacks: true },
      });

      if (themes && themes.length > 0) {
        return themes.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          color: t.color,
          count: t.feedbacks?.length || 0,
          changePercentage: 0,
          isSpike: (t.feedbacks?.length || 0) > 25,
        }));
      }
    } catch (e) {
      console.warn('Prisma getThemes fallback:', e);
    }

    // 3. Fallback to in-memory themes
    return this.themes.map((theme) => {
      const relatedFeedbacks = this.feedbacks.filter((f) =>
        f.themes.some((t) => t.toLowerCase() === theme.name.toLowerCase())
      );
      return {
        ...theme,
        count: relatedFeedbacks.length,
      };
    });
  }

  async addTheme(name: string, description: string, color: string, workspaceId: string = SEED_WORKSPACE.id): Promise<Theme> {
    const newTheme: Theme = {
      id: `theme-${Date.now()}`,
      name,
      description,
      color,
      count: 0,
      changePercentage: 0,
      isSpike: false,
    };
    this.themes.push(newTheme);

    // 1. Add to MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('themes').updateOne(
          { name: newTheme.name },
          { $set: { ...newTheme, workspaceId } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn('MongoDB addTheme fallback:', e);
    }

    // 2. Add to Prisma
    try {
      await prisma.theme.create({
        data: {
          id: newTheme.id,
          name: newTheme.name,
          description: newTheme.description,
          color: newTheme.color,
          workspaceId,
        },
      });
    } catch (e) {
      console.warn('Prisma addTheme fallback:', e);
    }

    return newTheme;
  }

  // Feedbacks
  async getFeedbacks(
    workspaceId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      channel?: string;
      sentiment?: string;
      status?: string;
      theme?: string;
    }
  ): Promise<{ data: Feedback[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 20;
    const offset = (page - 1) * limit;

    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const query: any = {};
        if (options?.channel && options.channel !== 'ALL') {
          query.channel = options.channel;
        }
        if (options?.sentiment && options.sentiment !== 'ALL') {
          query.sentiment = options.sentiment;
        }
        if (options?.status && options.status !== 'ALL') {
          query.status = options.status;
        }
        if (options?.theme && options.theme !== 'ALL') {
          query.themes = { $regex: options.theme, $options: 'i' };
        }
        if (options?.search && options.search.trim()) {
          const q = options.search.trim();
          query.$or = [
            { content: { $regex: q, $options: 'i' } },
            { customerLabel: { $regex: q, $options: 'i' } },
            { sourceRef: { $regex: q, $options: 'i' } },
            { featureArea: { $regex: q, $options: 'i' } },
            { rationale: { $regex: q, $options: 'i' } },
          ];
        }

        const col = db.collection<Feedback>('feedbacks');
        const total = await col.countDocuments(query);

        if (total > 0) {
          const rows = await col
            .find(query)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

          const totalPages = Math.max(1, Math.ceil(total / limit));
          const data: Feedback[] = rows.map((row: any) => ({
            id: row.id,
            content: row.content,
            channel: row.channel,
            sourceRef: row.sourceRef || '',
            customerLabel: row.customerLabel || 'Standard Customer',
            sentiment: row.sentiment,
            sentimentScore: row.sentimentScore ?? 0,
            status: row.status,
            createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date(row.createdAt).toISOString(),
            workspaceId: row.workspaceId || workspaceId,
            featureArea: row.featureArea || '',
            rationale: row.rationale || '',
            confidence: row.confidence ?? 0.9,
            themes: row.themes || [],
            arr: row.arr ?? 15000,
            customerTier: (row.arr ?? 15000) >= 40000 ? 'Enterprise' : (row.arr ?? 15000) >= 15000 ? 'Growth' : 'Startup',
            churnRisk: row.sentiment === 'NEGATIVE' ? ((row.arr ?? 15000) >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
            externalTicket: row.externalTicket,
            internalNotes: row.internalNotes,
          }));

          return {
            data,
            pagination: {
              total,
              page,
              limit,
              totalPages,
            },
          };
        }
      }
    } catch (e) {
      console.warn('MongoDB getFeedbacks fallback:', e);
    }

    // 2. Try Prisma
    try {
      const where: any = { workspaceId };

      if (options?.channel && options.channel !== 'ALL') {
        where.channel = options.channel;
      }
      if (options?.sentiment && options.sentiment !== 'ALL') {
        where.sentiment = options.sentiment;
      }
      if (options?.status && options.status !== 'ALL') {
        where.status = options.status;
      }
      if (options?.theme && options.theme !== 'ALL') {
        where.themes = {
          some: {
            theme: {
              name: {
                contains: options.theme,
              },
            },
          },
        };
      }
      if (options?.search && options.search.trim()) {
        const q = options.search.trim();
        where.OR = [
          { content: { contains: q } },
          { customerLabel: { contains: q } },
          { sourceRef: { contains: q } },
          { featureArea: { contains: q } },
        ];
      }

      const [total, rows] = await Promise.all([
        prisma.feedback.count({ where }),
        prisma.feedback.findMany({
          where,
          include: {
            themes: {
              include: { theme: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      ]);

      if (total > 0 || rows.length > 0) {
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const data: Feedback[] = rows.map((row: any) => ({
          id: row.id,
          content: row.content,
          channel: row.channel as any,
          sourceRef: row.sourceRef || '',
          customerLabel: row.customerLabel || 'Standard Customer',
          sentiment: row.sentiment as any,
          sentimentScore: row.sentimentScore,
          status: row.status as any,
          createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
          workspaceId: row.workspaceId,
          featureArea: row.featureArea || '',
          rationale: row.rationale || '',
          confidence: row.confidence,
          themes: row.themes.map((t: any) => t.theme?.name).filter(Boolean),
          arr: row.arr ?? 15000,
          customerTier: (row.arr ?? 15000) >= 40000 ? 'Enterprise' : (row.arr ?? 15000) >= 15000 ? 'Growth' : 'Startup',
          churnRisk: row.sentiment === 'NEGATIVE' ? ((row.arr ?? 15000) >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
        }));

        return {
          data,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        };
      }
    } catch (e) {
      console.warn('Prisma getFeedbacks fallback:', e);
    }

    // 3. In-memory fallback
    let result = [...this.feedbacks];
    if (workspaceId) {
      result = result.filter((f) => !f.workspaceId || f.workspaceId === workspaceId);
    }

    if (options?.channel && options.channel !== 'ALL') {
      result = result.filter((f) => f.channel === options.channel);
    }
    if (options?.sentiment && options.sentiment !== 'ALL') {
      result = result.filter((f) => f.sentiment === options.sentiment);
    }
    if (options?.status && options.status !== 'ALL') {
      result = result.filter((f) => f.status === options.status);
    }
    if (options?.theme && options.theme !== 'ALL') {
      result = result.filter((f) =>
        f.themes.some((t) => t.toLowerCase() === options.theme!.toLowerCase())
      );
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.content.toLowerCase().includes(q) ||
          f.customerLabel.toLowerCase().includes(q) ||
          f.sourceRef.toLowerCase().includes(q) ||
          f.featureArea.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const paginatedData = result.slice(offset, offset + limit);

    return {
      data: paginatedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getAllFeedbacksForWorkspace(workspaceId: string): Promise<Feedback[]> {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const rows = await db
          .collection<Feedback>('feedbacks')
          .find({})
          .sort({ createdAt: -1 })
          .toArray();

        if (rows && rows.length > 0) {
          return rows.map((row: any) => ({
            id: row.id,
            content: row.content,
            channel: row.channel,
            sourceRef: row.sourceRef || '',
            customerLabel: row.customerLabel || 'Standard Customer',
            sentiment: row.sentiment,
            sentimentScore: row.sentimentScore ?? 0,
            status: row.status,
            createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date(row.createdAt).toISOString(),
            workspaceId: row.workspaceId || workspaceId,
            featureArea: row.featureArea || '',
            rationale: row.rationale || '',
            confidence: row.confidence ?? 0.9,
            themes: row.themes || [],
            arr: row.arr ?? 15000,
            customerTier: (row.arr ?? 15000) >= 40000 ? 'Enterprise' : (row.arr ?? 15000) >= 15000 ? 'Growth' : 'Startup',
            churnRisk: row.sentiment === 'NEGATIVE' ? ((row.arr ?? 15000) >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
            externalTicket: row.externalTicket,
            internalNotes: row.internalNotes,
          }));
        }
      }
    } catch (e) {
      console.warn('MongoDB getAllFeedbacksForWorkspace fallback:', e);
    }

    // 2. Try Prisma
    try {
      const rows = await prisma.feedback.findMany({
        where: { workspaceId },
        include: {
          themes: {
            include: { theme: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (rows && rows.length > 0) {
        return rows.map((row: any) => ({
          id: row.id,
          content: row.content,
          channel: row.channel as any,
          sourceRef: row.sourceRef || '',
          customerLabel: row.customerLabel || 'Standard Customer',
          sentiment: row.sentiment as any,
          sentimentScore: row.sentimentScore,
          status: row.status as any,
          createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
          workspaceId: row.workspaceId,
          featureArea: row.featureArea || '',
          rationale: row.rationale || '',
          confidence: row.confidence,
          themes: row.themes.map((t: any) => t.theme?.name).filter(Boolean),
          arr: row.arr ?? 15000,
          customerTier: (row.arr ?? 15000) >= 40000 ? 'Enterprise' : (row.arr ?? 15000) >= 15000 ? 'Growth' : 'Startup',
          churnRisk: row.sentiment === 'NEGATIVE' ? ((row.arr ?? 15000) >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
        }));
      }
    } catch (e) {
      console.warn('Prisma getAllFeedbacksForWorkspace fallback:', e);
    }

    return this.feedbacks.filter((f) => !f.workspaceId || f.workspaceId === workspaceId);
  }

  async getFeedbackById(id: string, workspaceId: string): Promise<Feedback | undefined> {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const row: any = await db.collection('feedbacks').findOne({ id });
        if (row) {
          return {
            id: row.id,
            content: row.content,
            channel: row.channel,
            sourceRef: row.sourceRef || '',
            customerLabel: row.customerLabel || 'Standard Customer',
            sentiment: row.sentiment,
            sentimentScore: row.sentimentScore ?? 0,
            status: row.status,
            createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date(row.createdAt).toISOString(),
            workspaceId: row.workspaceId || workspaceId,
            featureArea: row.featureArea || '',
            rationale: row.rationale || '',
            confidence: row.confidence ?? 0.9,
            themes: row.themes || [],
            arr: row.arr ?? 15000,
            customerTier: (row.arr ?? 15000) >= 40000 ? 'Enterprise' : (row.arr ?? 15000) >= 15000 ? 'Growth' : 'Startup',
            churnRisk: row.sentiment === 'NEGATIVE' ? ((row.arr ?? 15000) >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
            externalTicket: row.externalTicket,
            internalNotes: row.internalNotes,
          };
        }
      }
    } catch (e) {
      console.warn('MongoDB getFeedbackById fallback:', e);
    }

    // 2. Try Prisma
    try {
      const row = await prisma.feedback.findFirst({
        where: { id },
        include: {
          themes: {
            include: { theme: true },
          },
        },
      });

      if (row) {
        return {
          id: row.id,
          content: row.content,
          channel: row.channel as any,
          sourceRef: row.sourceRef || '',
          customerLabel: row.customerLabel || 'Standard Customer',
          sentiment: row.sentiment as any,
          sentimentScore: row.sentimentScore,
          status: row.status as any,
          createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
          workspaceId: row.workspaceId,
          featureArea: row.featureArea || '',
          rationale: row.rationale || '',
          confidence: row.confidence,
          themes: row.themes.map((t: any) => t.theme?.name).filter(Boolean),
          arr: row.arr ?? 15000,
          customerTier: (row.arr ?? 15000) >= 40000 ? 'Enterprise' : (row.arr ?? 15000) >= 15000 ? 'Growth' : 'Startup',
          churnRisk: row.sentiment === 'NEGATIVE' ? ((row.arr ?? 15000) >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
        };
      }
    } catch (e) {
      console.warn('Prisma getFeedbackById fallback:', e);
    }

    return this.feedbacks.find((f) => f.id === id);
  }

  async addFeedback(feedback: Feedback): Promise<Feedback> {
    this.feedbacks.unshift(feedback);

    // 1. Add to MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('feedbacks').updateOne(
          { id: feedback.id },
          { $set: feedback },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn('MongoDB addFeedback fallback:', e);
    }

    // 2. Add to Prisma
    try {
      const created = await prisma.feedback.create({
        data: {
          id: feedback.id,
          content: feedback.content,
          channel: feedback.channel,
          sourceRef: feedback.sourceRef,
          customerLabel: feedback.customerLabel,
          sentiment: feedback.sentiment,
          sentimentScore: feedback.sentimentScore,
          status: feedback.status,
          featureArea: feedback.featureArea,
          rationale: feedback.rationale,
          confidence: feedback.confidence,
          arr: feedback.arr,
          workspaceId: feedback.workspaceId || SEED_WORKSPACE.id,
          createdAt: feedback.createdAt ? new Date(feedback.createdAt) : new Date(),
        },
      });

      // Link themes in Prisma
      for (const themeName of feedback.themes || []) {
        try {
          let theme = await prisma.theme.findFirst({
            where: { workspaceId: feedback.workspaceId, name: themeName },
          });
          if (!theme) {
            theme = await prisma.theme.create({
              data: {
                name: themeName,
                description: `${themeName} focus area`,
                workspaceId: feedback.workspaceId || SEED_WORKSPACE.id,
              },
            });
          }
          await prisma.feedbackTheme.upsert({
            where: {
              feedbackId_themeId: {
                feedbackId: created.id,
                themeId: theme.id,
              },
            },
            update: {},
            create: {
              feedbackId: created.id,
              themeId: theme.id,
              confidence: 0.95,
            },
          });
        } catch (themeErr) {
          console.warn('Theme link error:', themeErr);
        }
      }
    } catch (e) {
      console.warn('Prisma addFeedback fallback:', e);
    }

    return feedback;
  }

  async updateFeedbackStatus(id: string, status: Status, workspaceId: string): Promise<Feedback | null> {
    const item = this.feedbacks.find((f) => f.id === id);
    if (item) item.status = status;

    // 1. Update in MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('feedbacks').updateOne(
          { id },
          { $set: { status, updatedAt: new Date() } }
        );
      }
    } catch (e) {
      console.warn('MongoDB updateFeedbackStatus fallback:', e);
    }

    // 2. Update in Prisma
    try {
      await prisma.feedback.update({
        where: { id },
        data: { status },
      });
    } catch (e) {
      console.warn('Prisma updateFeedbackStatus fallback:', e);
    }

    return this.getFeedbackById(id, workspaceId).then((r) => r || item || null);
  }

  async updateFeedbackClassification(
    id: string,
    workspaceId: string,
    classification: {
      sentiment: any;
      sentimentScore: number;
      themes: string[];
      featureArea: string;
      rationale: string;
    }
  ): Promise<Feedback | null> {
    const item = this.feedbacks.find((f) => f.id === id);
    if (item) {
      item.sentiment = classification.sentiment;
      item.sentimentScore = classification.sentimentScore;
      item.themes = classification.themes;
      item.featureArea = classification.featureArea;
      item.rationale = classification.rationale;
    }

    // 1. Update in MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('feedbacks').updateOne(
          { id },
          {
            $set: {
              sentiment: classification.sentiment,
              sentimentScore: classification.sentimentScore,
              themes: classification.themes,
              featureArea: classification.featureArea,
              rationale: classification.rationale,
              updatedAt: new Date(),
            },
          }
        );
      }
    } catch (e) {
      console.warn('MongoDB updateFeedbackClassification fallback:', e);
    }

    // 2. Update in Prisma
    try {
      await prisma.feedback.update({
        where: { id },
        data: {
          sentiment: classification.sentiment,
          sentimentScore: classification.sentimentScore,
          featureArea: classification.featureArea,
          rationale: classification.rationale,
        },
      });

      // Update theme relations
      if (classification.themes && classification.themes.length > 0) {
        for (const themeName of classification.themes) {
          let theme = await prisma.theme.findFirst({
            where: { workspaceId, name: themeName },
          });
          if (!theme) {
            theme = await prisma.theme.create({
              data: {
                name: themeName,
                description: `${themeName} category`,
                workspaceId,
              },
            });
          }
          await prisma.feedbackTheme.upsert({
            where: {
              feedbackId_themeId: {
                feedbackId: id,
                themeId: theme.id,
              },
            },
            update: {},
            create: {
              feedbackId: id,
              themeId: theme.id,
              confidence: 0.95,
            },
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Prisma updateFeedbackClassification fallback:', e);
    }

    return this.getFeedbackById(id, workspaceId).then((r) => r || item || null);
  }

  // Reports
  async getReports(workspaceId: string): Promise<Report[]> {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const rows = await db.collection<Report>('reports').find({}).sort({ createdAt: -1 }).toArray();
        if (rows && rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            period: r.period || 'Recent Period',
            periodStart: typeof r.periodStart === 'string' ? r.periodStart : new Date(r.periodStart).toISOString(),
            periodEnd: typeof r.periodEnd === 'string' ? r.periodEnd : new Date(r.periodEnd).toISOString(),
            summary: r.summary || '',
            executiveTakeaway: r.executiveTakeaway || '',
            stats: r.stats || {
              totalFeedback: 0,
              positivePercentage: 0,
              neutralPercentage: 0,
              negativePercentage: 0,
              sentimentDelta: 0,
              topThemes: [],
            },
            verbatimQuotes: r.verbatimQuotes || [],
            keyRisks: r.keyRisks || [],
            recommendedActions: r.recommendedActions || [],
            createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(r.createdAt).toISOString(),
            author: r.author || 'LOOP Intelligence Engine',
            workspaceId: r.workspaceId || workspaceId,
          }));
        }
      }
    } catch (e) {
      console.warn('MongoDB getReports fallback:', e);
    }

    // 2. Try Prisma
    try {
      const rows = await prisma.report.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });

      if (rows && rows.length > 0) {
        return rows.map((r: any) => {
          try {
            return JSON.parse(r.contentJson);
          } catch {
            return {
              id: r.id,
              title: r.title,
              period: `${r.periodStart.toISOString().split('T')[0]} - ${r.periodEnd.toISOString().split('T')[0]}`,
              periodStart: r.periodStart.toISOString(),
              periodEnd: r.periodEnd.toISOString(),
              summary: 'Summary report generated from database',
              executiveTakeaway: 'Key VoC trends across monitored channels.',
              stats: {
                totalFeedback: 0,
                positivePercentage: 0,
                neutralPercentage: 0,
                negativePercentage: 0,
                sentimentDelta: 0,
                topThemes: [],
              },
              verbatimQuotes: [],
              keyRisks: [],
              recommendedActions: [],
              createdAt: r.createdAt.toISOString(),
              author: 'LOOP Intelligence Engine',
              workspaceId: r.workspaceId,
            };
          }
        });
      }
    } catch (e) {
      console.warn('Prisma getReports fallback:', e);
    }

    return this.reports.filter((r) => !r.workspaceId || r.workspaceId === workspaceId);
  }

  async getReportById(id: string, workspaceId: string): Promise<Report | undefined> {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const r: any = await db.collection('reports').findOne({ id });
        if (r) {
          return {
            id: r.id,
            title: r.title,
            period: r.period || '',
            periodStart: typeof r.periodStart === 'string' ? r.periodStart : new Date(r.periodStart).toISOString(),
            periodEnd: typeof r.periodEnd === 'string' ? r.periodEnd : new Date(r.periodEnd).toISOString(),
            summary: r.summary || '',
            executiveTakeaway: r.executiveTakeaway || '',
            stats: r.stats,
            verbatimQuotes: r.verbatimQuotes || [],
            keyRisks: r.keyRisks || [],
            recommendedActions: r.recommendedActions || [],
            createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(r.createdAt).toISOString(),
            author: r.author || 'LOOP Intelligence Engine',
            workspaceId: r.workspaceId || workspaceId,
          };
        }
      }
    } catch (e) {
      console.warn('MongoDB getReportById fallback:', e);
    }

    // 2. Try Prisma
    try {
      const r = await prisma.report.findFirst({
        where: { id },
      });
      if (r) {
        try {
          return JSON.parse(r.contentJson);
        } catch {
          return undefined;
        }
      }
    } catch (e) {
      console.warn('Prisma getReportById fallback:', e);
    }

    return this.reports.find((r) => r.id === id);
  }

  async addReport(report: Report): Promise<Report> {
    this.reports.unshift(report);

    // 1. Add to MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('reports').updateOne(
          { id: report.id },
          { $set: report },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn('MongoDB addReport fallback:', e);
    }

    // 2. Add to Prisma
    try {
      await prisma.report.create({
        data: {
          id: report.id,
          title: report.title,
          periodStart: new Date(report.periodStart),
          periodEnd: new Date(report.periodEnd),
          contentJson: JSON.stringify(report),
          workspaceId: report.workspaceId || SEED_WORKSPACE.id,
          generatedById: 'user-admin-1',
        },
      });
    } catch (e) {
      console.warn('Prisma addReport fallback:', e);
    }

    return report;
  }
}

// Singleton global data store
const globalForDataStore = globalThis as unknown as { dataStore: DataStore | undefined };
export const dataStore = globalForDataStore.dataStore ?? new DataStore();
if (process.env.NODE_ENV !== 'production') globalForDataStore.dataStore = dataStore;

export default dataStore;
