import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../../api/api";

const Otpschema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});

export default function OtpVerifyScreen({ route, navigation }) {
  const { email, mode } = route?.params || {};

  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      Alert.alert("Error", "Email missing");
      navigation.goBack();
    }
  }, [email]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (values) => {
    try {
      setLoading(true);

      // REGISTER OTP FLOW
      if (mode === "register") {
        await api.post("/auth/verify-otp", {
          email,
          otp: values.otp,
        });

        Alert.alert("Success", "Email verified", [
          { text: "OK", onPress: () => navigation.replace("Login") },
        ]);
      }

      // RESET PASSWORD FLOW → go to reset screen
      if (mode === "reset") {
        navigation.navigate("ResetPassword", {
          email,
          otp: values.otp,
        });
      }

    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setResendLoading(true);

      if (mode === "register") {
        await api.post("/auth/resend-otp", { email });
      } else {
        await api.post("/auth/forgot-password", { email });
      }

      setTimer(30);
      Alert.alert("Success", "OTP resent successfully");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Enter OTP</Text>

          <Formik
            initialValues={{ otp: "" }}
            validationSchema={Otpschema}
            onSubmit={handleVerify}
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
                  label="OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={values.otp}
                  onChangeText={(text) =>
                    handleChange("otp")(text.replace(/[^0-9]/g, ""))
                  }
                  onBlur={handleBlur("otp")}
                  style={styles.input}
                />

                {touched.otp && errors.otp && (
                  <Text style={styles.error}>{errors.otp}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading || values.otp.length !== 6}
                >
                  Verify OTP
                </Button>

                <Text style={styles.timer}>
                  {timer > 0 ? `Resend in ${timer}s` : "Didn't receive OTP?"}
                </Text>

                {timer === 0 && (
                  <Button
                    onPress={resendOtp}
                    loading={resendLoading}
                    mode="outlined"
                  >
                    Resend OTP
                  </Button>
                )}
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
  input: { marginBottom: 10 },
  error: { color: "red", fontSize: 12 },
  timer: { textAlign: "center", marginTop: 10, color: "#666" },
});