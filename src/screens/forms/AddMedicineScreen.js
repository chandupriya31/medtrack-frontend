import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import { DatePickerModal, registerTranslation } from "react-native-paper-dates";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import api from "../../api/api";

export default function AddMedicineScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patient");
      setPatients(res.data || []);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch patients",
      });
    }
  };

  const instructionOptions = [
    { label: "Before Food", value: "Before Food" },
    { label: "After Food", value: "After Food" },
    { label: "Empty Stomach", value: "Empty Stomach" },
    { label: "Other", value: "Other" },
  ];

  const calculateDuration = () => {
    const diff =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff + 1;
  };

  const handleAddMedicine = async () => {
    if (!selectedPatient || !name || !dosage || !instructions) {
      Toast.show({
        type: "error",
        text1: "Please fill all required fields",
      });
      return;
    }

    if (instructions === "Other" && !customInstructions) {
      Toast.show({
        type: "error",
        text1: "Please provide custom instructions",
      });
      return;
    }

    if (endDate < startDate) {
      Toast.show({
        type: "error",
        text1: "End date must be after start date",
      });
      return;
    }

    const payload = {
      patient_id: selectedPatient,
      name,
      dosage,
      instructions:
        instructions === "Other" ? customInstructions : instructions,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      duration: calculateDuration(),
      status: "active",
    };

    try {
      await api.post("/medicines", payload);

      Toast.show({
        type: "success",
        text1: "Medicine added successfully!",
      });

      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to add medicine",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      <Card style={styles.card}>
        <Card.Content>
          <Dropdown
            style={styles.dropdown}
            data={patients}
            labelField="name" // make sure backend sends `name`
            valueField="patient_id"
            placeholder="Select Patient"
            value={selectedPatient}
            onChange={(item) => setSelectedPatient(item.patient_id)}
          />

          <TextInput
            label="Medicine Name"
            mode="outlined"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            label="Dosage"
            mode="outlined"
            value={dosage}
            onChangeText={setDosage}
            style={styles.input}
          />

          <Dropdown
            style={styles.dropdown}
            data={instructionOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Instructions"
            value={instructions}
            onChange={(item) => setInstructions(item.value)}
          />

          {instructions === "Other" && (
            <TextInput
              label="Custom Instructions"
              mode="outlined"
              value={customInstructions}
              onChangeText={setCustomInstructions}
              style={styles.input}
            />
          )}

          <TextInput
            label="Start Date"
            mode="outlined"
            value={startDate.toDateString()}
            editable={false}
            style={styles.input}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setOpenStart(true)}
              />
            }
          />

          <DatePickerModal
            locale="en"
            mode="single"
            visible={openStart}
            date={startDate}
            onDismiss={() => setOpenStart(false)}
            onConfirm={({ date }) => {
              setOpenStart(false);
              if (date) setStartDate(date);
            }}
          />

          <TextInput
            label="End Date"
            mode="outlined"
            value={endDate.toDateString()}
            editable={false}
            style={styles.input}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setOpenEnd(true)}
              />
            }
          />

          <DatePickerModal
            locale="en"
            mode="single"
            visible={openEnd}
            date={endDate}
            onDismiss={() => setOpenEnd(false)}
            onConfirm={({ date }) => {
              setOpenEnd(false);
              if (date) setEndDate(date);
            }}
          />

          <Button
            mode="contained"
            onPress={handleAddMedicine}
            style={styles.saveBtn}
          >
            Add Medicine
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f4f7fb",
  },
  card: {
    borderRadius: 16,
    padding: 10,
    elevation: 4,
  },
  input: {
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  saveBtn: {
    marginTop: 15,
    borderRadius: 8,
    paddingVertical: 6,
  },
});
