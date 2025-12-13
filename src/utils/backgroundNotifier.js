const { getAllActiveUsersPushTokens } = require("../models/authModel");
const { sendNotificationToUsers } = require("../services/notificationService");

async function notifyAllUsersInBackground(title, body) {
  setImmediate(async () => {
    try {
      console.log("📢 Background Notification Started...");

      const result = await getAllActiveUsersPushTokens();
      if (!result.success) {
        console.error("Failed to get active users:", result.message);
        return;
      }

      const tokens = result.users.map((u) => u.push_token);

      // OPTIONAL: Batch tokens (FCM allows 500 tokens per multicast)
      const batchSize = 400;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        await sendNotificationToUsers(batch, { title, body });
      }

      console.log("📢 Background Notification Completed.");
    } catch (err) {
      console.error("❌ Background notification error:", err.message);
    }
  });
}

module.exports = { notifyAllUsersInBackground };
