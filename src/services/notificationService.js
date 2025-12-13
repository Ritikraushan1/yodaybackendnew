const admin = require("../firebase");

async function sendNotificationToUsers(tokens, messageData) {
  if (!tokens.length) {
    console.log("No FCM tokens provided");
    return;
  }

  const message = {
    notification: {
      title: messageData.title,
      body: messageData.body,
    },
    data: messageData.data || {},
    tokens: tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("Notifications sent:", response.successCount);
    console.log("Notifications failed:", response.failureCount);

    return response;
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}

module.exports = { sendNotificationToUsers };
