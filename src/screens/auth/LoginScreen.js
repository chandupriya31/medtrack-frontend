import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/api";
import { setCredentials, clearError } from "../../redux/authSlice";
import { registerForPush } from "../forms/notification";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
});

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error]);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", values);
      const { accessToken, refreshToken } = res.data;

      dispatch(setCredentials({ accessToken, refreshToken }));
      if (res.data) {
        await registerForPush(accessToken);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Logged in!",
      });

      navigation.replace("App");
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Try again.";

      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Welcome Back</Title>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  error={touched.email && !!errors.email}
                  outlineColor="#D1C4E9"
                  activeOutlineColor="#6C4AB6"
                  placeholderTextColor="#999"
                  textColor="#333"
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <TextInput
                  label="Password"
                  mode="outlined"
                  secureTextEntry={!passwordVisible}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  style={styles.input}
                  error={touched.password && !!errors.password}
                  outlineColor="#D1C4E9"
                  activeOutlineColor="#6C4AB6"
                  placeholderTextColor="#999"
                  textColor="#333"
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? "eye-off" : "eye"}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                />
                {touched.password && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={{ alignSelf: "flex-end", marginBottom: 15 }}
                >
                  <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={{ paddingVertical: 10 }}
                  buttonColor="#6C4AB6"
                  textColor="#fff"
                >
                  Login
                </Button>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Don't have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Register")}
                  >
                    <Text style={styles.link}> Register</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F0EFFF",
  },
  card: {
    padding: 25,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#6C4AB6",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
    color: "#4A148C",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  error: {
    color: "#D32F2F",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
  },
  link: {
    color: "#6C4AB6",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
});