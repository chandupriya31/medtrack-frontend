import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../../api/api";

const Resetschema = Yup.object().shape({
  password: Yup.string().min(6).required("Password required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password required"),
});

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, otp } = route?.params || {};
  const [loading, setLoading] = useState(false);

  const handleReset = async (values) => {
    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword: values.password,
      });

      Alert.alert("Success", "Password reset successful", [
        { text: "Login", onPress: () => navigation.replace("Login") },
      ]);

    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <View style={styles.center}>
        <Text>Invalid reset flow</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Reset Password</Text>

          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={Resetschema}
            onSubmit={handleReset}
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
                  label="New Password"
                  secureTextEntry
                  value={values.password}
                  onChangeText={handleChange("password")}
                />

                <TextInput
                  label="Confirm Password"
                  secureTextEntry
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                >
                  Reset Password
                </Button>
              </>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: { padding: 20 },
  title: { textAlign: "center", fontSize: 20, marginBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});