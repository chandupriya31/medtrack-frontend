import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { Platform, PermissionsAndroid } from "react-native";
import api from "../../api/api";

async function requestPermission() {
  if (Platform.OS === "android" && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  }

  await messaging().requestPermission();
}

async function createChannel() {
  await notifee.createChannel({
    id: "medicine",
    name: "Medicine Reminders",
    importance: AndroidImportance.HIGH,
  });
}

const handledMessages = new Set();

export function listenForForegroundMessages() {
  return messaging().onMessage(async (remoteMessage) => {

    console.log("🟢 Foreground message received:", remoteMessage);

    if (handledMessages.has(remoteMessage.messageId)) {
      console.log("Duplicate message ignored");
      return;
    }

    handledMessages.add(remoteMessage.messageId);

    const title = remoteMessage.notification?.title;
    const body = remoteMessage.notification?.body;

    if (!title || !body) return;

    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: "medicine",
        importance: AndroidImportance.HIGH,
        pressAction: { id: "default" },
      },
    });

    console.log("✅ Foreground notification displayed");
  });
}

export async function registerForPush(accessToken) {
  try {
    console.log("🚀 registerForPush called");

    await requestPermission();
    await createChannel();

    const token = await messaging().getToken();
    console.log("✅ FCM Token:", token);

    await api.post(
      "/auth/save-device-token",
      { device_token: token },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    messaging().onTokenRefresh(async (newToken) => {
      console.log("🔄 Token refreshed:", newToken);
      await api.post(
        "/auth/save-device-token",
        { device_token: newToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    });
  } catch (err) {
    console.log("❌ Push setup error:", err);
  }
}