import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector, useDispatch } from "react-redux";
import { loadAuthData, logoutUser } from "../../redux/authSlice";
import LoginScreen from "../auth/LoginScreen";
import RegisterScreen from "../auth/RegisterScreen";
import ForgotPasswordScreen from "../auth/Forgot";
import AppTabs from "./AppTabs";
import OtpVerifyScreen from "../auth/Otp";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadAuthData());
  }, []);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name = "OTP" component = {OtpVerifyScreen}/>
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}