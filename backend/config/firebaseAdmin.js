import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
    throw e;
  }
}

// --- 2. Load dari file fallback ---
if (!serviceAccount) {
  const filePath = path.resolve(process.cwd(), 'config', 'firebase-service-account.json');
  if (fs.existsSync(filePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}

if (!serviceAccount) {
  console.warn("No Firebase credentials found.");
}

let db = null;

try {
  if (serviceAccount) {
    const databaseURL =
      process.env.FIREBASE_DATABASE_URL ||
      process.env.FIREBASE_RTDB_URL ||
      serviceAccount.database_url ||
      (serviceAccount.project_id
        ? `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`
        : null);

    if (!databaseURL) {
      throw new Error("Database URL missing.");
    }

    // Prevent duplicate initialization
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL,
      });
    }

    db = admin.database();
  }
} catch (err) {
  console.warn("Firebase initialization failed:", err.message);
}

export default db;
