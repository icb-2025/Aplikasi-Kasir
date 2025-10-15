#!/usr/bin/env node
import mongoose from 'mongoose';
import path from 'path';
import db from '../config/firebaseAdmin.js';
import initDb from '../database/db.js';
import Barang from '../models/databarang.js';

async function main() {
  console.log('Connecting to MongoDB...');
  await initDb();

  console.log('Fetching barang from MongoDB...');
  const barangs = await Barang.find().lean();

  if (!db) {
    console.error('Firebase DB not initialized. Set FIREBASE_SERVICE_ACCOUNT or add config/firebase-service-account.json');
    process.exit(1);
  }

  const ref = db.ref('/barang');
  console.log(`Writing ${barangs.length} items to Firebase RTDB /barang`);

  const updates = {};
  barangs.forEach(item => {
    // Use Mongo id as key
    updates[item._id.toString()] = item;
  });

  await ref.update(updates);

  console.log('Migration complete.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
