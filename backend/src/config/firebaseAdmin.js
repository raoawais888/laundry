const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production (Heroku): parse JSON from env var
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local development: read from file
  serviceAccount = require("./serviceAccountKey.json");
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

const adminAuth = getAuth(app);

module.exports = { adminAuth };