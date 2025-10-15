import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Try to load service account from env var FIREBASE_SERVICE_ACCOUNT (JSON string)
// or from a local file at config/firebase-service-account.json (gitignored ideally).
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error('Invalid JSON in FIREBASE_SERVICE_ACCOUNT env var');
    throw e;
  }
} else {
  const p = path.resolve(process.cwd(), 'config', 'firebase-service-account.json');
  if (fs.existsSync(p)) {
    serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
}

if (!serviceAccount) {
  console.warn('Firebase service account not found. RTDB features will fail until credentials are provided.');
}

let db = null;
try {
  let app;
  if (serviceAccount) {
    const databaseURL = process.env.FIREBASE_DATABASE_URL || serviceAccount.database_url || process.env.FIREBASE_RTDB_URL || (serviceAccount.project_id ? `https://aplikasi-kasir-21236-default-rtdb.asia-southeast1.firebasedatabase.app` : null);
    if (!databaseURL) throw new Error('No RTDB URL provided in serviceAccount or env');

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL
    });
    db = admin.database();
  } else {
    // do not initialize default app without credentials
    console.warn('Skipping firebase initializeApp because no service account provided');
    db = null;
  }
} catch (e) {
  if (e.code === 'app/duplicate-app') {
    try {
      db = admin.database();
    } catch (err) {
      console.warn('Firebase already initialized but database unavailable:', err.message);
      db = null;
    }
  } else {
    console.warn('Firebase initialization failed:', e.message);
    db = null;
  }
}

export default db;
