import { MongoClient } from 'mongodb';
import {
  SEED_FEEDBACKS,
  SEED_THEMES,
  SEED_USERS,
  SEED_WORKSPACE,
  SEED_REPORTS,
} from '../src/data/seedFeedback';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loop_db';
const dbName = process.env.MONGODB_DB_NAME || 'loop_db';

async function seed() {
  console.log(`🔌 Connecting to MongoDB: ${uri}`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB server.');

    const db = client.db(dbName);

    // 1. Workspace
    console.log('📦 Seeding workspace...');
    await db.collection('workspaces').updateOne(
      { id: SEED_WORKSPACE.id },
      { $set: SEED_WORKSPACE },
      { upsert: true }
    );

    // 2. Users
    console.log(`👤 Seeding ${SEED_USERS.length} users...`);
    for (const u of SEED_USERS) {
      await db.collection('users').updateOne({ id: u.id }, { $set: u }, { upsert: true });
    }

    // 3. Themes
    console.log(`🎨 Seeding ${SEED_THEMES.length} themes...`);
    for (const t of SEED_THEMES) {
      await db.collection('themes').updateOne({ id: t.id }, { $set: t }, { upsert: true });
    }

    // 4. Feedbacks
    console.log(`💬 Seeding ${SEED_FEEDBACKS.length} feedbacks...`);
    for (const f of SEED_FEEDBACKS) {
      await db.collection('feedbacks').updateOne({ id: f.id }, { $set: f }, { upsert: true });
    }

    // 5. Reports
    console.log(`📑 Seeding ${SEED_REPORTS.length} reports...`);
    for (const r of SEED_REPORTS) {
      await db.collection('reports').updateOne({ id: r.id }, { $set: r }, { upsert: true });
    }

    // Summary counts
    const feedbacksCount = await db.collection('feedbacks').countDocuments();
    const themesCount = await db.collection('themes').countDocuments();
    const usersCount = await db.collection('users').countDocuments();

    console.log('\n🎉 MongoDB Seeding Complete!');
    console.log(`   - Database: ${dbName}`);
    console.log(`   - Feedbacks: ${feedbacksCount}`);
    console.log(`   - Themes: ${themesCount}`);
    console.log(`   - Users: ${usersCount}`);
  } catch (error) {
    console.error('❌ MongoDB seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
