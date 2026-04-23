import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import RootNavigator from "./src/screens/navigation/RootNavigator";
import { listenForForegroundMessages } from "./src/screens/forms/notification";
import Toast from "react-native-toast-message";

export default function App() {
  useEffect(() => {
    const unsubscribe = listenForForegroundMessages();
    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <Toast />
      </PaperProvider>
    </Provider>
  );
}