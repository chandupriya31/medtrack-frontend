import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { TextInput, Button, Card } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../../api/api";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
});

export default function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async (values, { resetForm }) => {
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email: values.email });
      resetForm();
      Toast.show({
  type: "success",
  text1: "Success",
  text2: "OTP sent to your email.",
});
navigation.replace("OTP", { email: values.email, mode: "forgot" });
    } catch (err) {
      Toast.show({
  type: "error",
  text1: "Error",
  text2: err.response?.data?.message || "Something went wrong",
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
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email to receive a reset link.
          </Text>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSendLink}
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
                  keyboardType="email-address"
                  style={styles.input}
                  error={touched.email && !!errors.email}
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Send Reset Link
                </Button>

                <Text style={styles.footerText}>
                  Remember your password?{" "}
                  <Text
                    style={styles.link}
                    onPress={() => navigation.navigate("Login")}
                  >
                    Login
                  </Text>
                </Text>
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
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  card: { padding: 20, borderRadius: 15 },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: { textAlign: "center", marginBottom: 20, color: "#555" },
  input: { marginBottom: 10 },
  error: { color: "red", fontSize: 12, marginBottom: 8 },
  button: { marginTop: 10, borderRadius: 8 },
  footerText: { textAlign: "center", marginTop: 15 },
  link: { color: "#6C4AB6", fontWeight: "500" },
});
