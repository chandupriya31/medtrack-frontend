import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
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
      device_token: fcmToken
      });

      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Try again.";
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
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <TextInput
                  label="Full Name"
                  mode="outlined"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  style={styles.input}
                  error={touched.name && !!errors.name}
                  outlineColor="#D1C4E9"
                  activeOutlineColor="#6C4AB6"
                  placeholderTextColor="#999"
                />
                {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

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
                  outlineColor="#D1C4E9"
                  activeOutlineColor="#6C4AB6"
                  placeholderTextColor="#999"
                />
                {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

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
                  right={
                    <TextInput.Icon
                        icon={passwordVisible ? "eye-off" : "eye"}
                        onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                />
                {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

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
                  Register
                </Button>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.replace("Login")}>
                    <Text style={styles.loginLink}>Sign In</Text>
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
    fontSize: 26,
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
    marginTop: 15,
    borderRadius: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  loginLink: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#6C4AB6",
  },
});