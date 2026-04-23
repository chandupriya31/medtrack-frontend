import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import Toast from "react-native-toast-message";
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
  console.log("OTP Verification Screen", { email, mode });

  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otpArray];
    newOtp[index] = text;
    setOtpArray(newOtp);
    if (text && index < 5) {
      inputs[index + 1].focus();
    }

    handleChange("otp")(newOtp.join(""));
  };

  const handleBackspace = (key, index) => {
    if (key === "Backspace" && index > 0 && !otpArray[index]) {
      inputs[index - 1].focus();
    }
  };

  useEffect(() => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email missing",
      });
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
      if (mode === "register") {
        await api.post("/auth/verify-email", {
          email,
          otp: values.otp,
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Email verified",
        });
        navigation.replace("Login");
      }
      if (mode === "reset") {
        await api.post("/auth/verify-reset-otp", {
          email,
          otp: values.otp,
        });

        navigation.navigate("ResetPassword", {
          email,
          otp: values.otp,
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "Invalid or expired OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (resetForm) => {
    try {
      setResendLoading(true);

      if (mode === "register") {
        await api.post("/auth/resend-otp", { email });
      } else {
        await api.post("/auth/forgot-password", { email });
      }
      setOtpArray(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      resetForm();
      setTimer(30);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "New OTP sent",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "Failed to resend OTP",
      });
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
              resetForm,
              values,
              errors,
              touched,
            }) => {
              const handleOtpChange = (text, index) => {
                const newOtp = [...otpArray];
                newOtp[index] = text;
                setOtpArray(newOtp);

                if (text && index < 5) {
                  inputs.current[index + 1]?.focus();
                }

                handleChange("otp")(newOtp.join(""));
              };

              const handleBackspace = (key, index) => {
                if (key === "Backspace" && index > 0 && !otpArray[index]) {
                  inputs.current[index - 1]?.focus();
                }
              };

              return (
                <>
                  <View style={styles.otpContainer}>
                    {otpArray.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (inputs.current[index] = ref)}
                        style={styles.otpBox}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) =>
                          handleOtpChange(text.replace(/[^0-9]/g, ""), index)
                        }
                        onKeyPress={({ nativeEvent }) =>
                          handleBackspace(nativeEvent.key, index)
                        }
                      />
                    ))}
                  </View>

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
                      onPress={() => resendOtp(resetForm)}
                      loading={resendLoading}
                      mode="outlined"
                    >
                      Resend OTP
                    </Button>
                  )}
                </>
              );
            }}
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
  },
});
