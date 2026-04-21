import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../../api/api";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, getToken } from "@react-native-firebase/messaging";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    const initFCM = async () => {
      const app = getApp();
      const messaging = getMessaging(app);
      const token = await getToken(messaging);
      setFcmToken(token);
    };
    initFCM();
  }, []);

  const handleRegister = async (values) => {
    try {
      setLoading(true);

      await api.post("/auth/register", {
        ...values,
        device_token: fcmToken,
      });

      navigation.navigate("OtpVerify", {
        email: values.email,
      });

    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create Account</Title>

          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
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
                  label="Full Name"
                  mode="outlined"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  style={styles.input}
                  error={touched.name && !!errors.name}
                />
                {touched.name && errors.name && (
                  <Text style={styles.error}>{errors.name}</Text>
                )}

                <TextInput
                  label="Email"
                  mode="outlined"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  error={touched.email && !!errors.email}
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
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? "eye-off" : "eye"}
                      onPress={() =>
                        setPasswordVisible(!passwordVisible)
                      }
                    />
                  }
                />
                {touched.password && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Register
                </Button>
              </>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: { padding: 20 },
  title: { textAlign: "center", fontSize: 22, marginBottom: 20 },
  input: { marginBottom: 10 },
  error: { color: "red" },
  button: { marginTop: 10 },
});