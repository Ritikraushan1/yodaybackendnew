const admin = require("firebase-admin");
const serviceAccount = require("./serviceKeyAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
