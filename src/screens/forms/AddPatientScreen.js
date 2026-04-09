import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import api from "../../api/api";

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export default function AddPatientScreen({ navigation, route }) {
  const patient = route.params?.patient;

  const [name, setName] = useState(patient?.name || "");
  const [age, setAge] = useState(patient?.age?.toString() || "");
  const [gender, setGender] = useState(patient?.gender || "");
  const [phoneNumber, setPhoneNumber] = useState(patient?.phone_number || "");
  const [medicalCondition, setMedicalCondition] =
    useState(patient?.medical_condition || "");
  const [doctorName, setDoctorName] =
    useState(patient?.doctor_name || "");
  const [loading, setLoading] = useState(false);

  const handleSavePatient = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedName || !age || !gender || !trimmedPhone) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    if (isNaN(age) || Number(age) <= 0) {
      Alert.alert("Validation", "Please enter valid age");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: trimmedName,
        age: Number(age),
        gender,
        phone_number: trimmedPhone,
        medical_condition: medicalCondition.trim(),
        doctor_name: doctorName.trim(),
      };

      if (patient) {
        await api.put(`/patient/${patient.patient_id}`, payload);
        Alert.alert("Success", "Patient updated successfully!");
      } else {
        await api.post("/patient", payload);
        Alert.alert("Success", "Patient added successfully!");
      }

      navigation.goBack();
    } catch (err) {
      console.log("Save error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Name *"
        mode="outlined"
        style={styles.input}
        onChangeText={setName}
        value={name}
      />

      <TextInput
        label="Age *"
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        onChangeText={setAge}
        value={age}
      />

      <Dropdown
        style={styles.dropdown}
        data={genderOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Gender *"
        value={gender}
        onChange={(item) => setGender(item.value)}
      />

      <TextInput
        label="Phone *"
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
        onChangeText={setPhoneNumber}
        value={phoneNumber}
      />

      <TextInput
        label="Medical Condition"
        mode="outlined"
        style={styles.input}
        onChangeText={setMedicalCondition}
        value={medicalCondition}
      />

      <TextInput
        label="Doctor Name"
        mode="outlined"
        style={styles.input}
        onChangeText={setDoctorName}
        value={doctorName}
      />

      <Button
        mode="contained"
        style={styles.btn}
        loading={loading}
        disabled={loading}
        onPress={handleSavePatient}
      >
        {patient ? "Update Patient" : "Save Patient"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f7fb" },
  input: { marginBottom: 12 },
  dropdown: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginBottom: 12,
    justifyContent: "center",
  },
  btn: { marginTop: 14 },
});