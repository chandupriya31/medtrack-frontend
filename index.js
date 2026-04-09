import { AppRegistry } from "react-native";
import messaging from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import App from "./App";
import { name as appName } from "./app.json";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("📩 Background message:", remoteMessage);

  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    "💊 Reminder";

  const body =
    remoteMessage.notification?.body ||
    remoteMessage.data?.body ||
    "Time to take your medicine";

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: "medicine",
      pressAction: { id: "default" },
    },
  });
});

AppRegistry.registerComponent(appName, () => App);