import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, TextInput, Card } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import api from "../../api/api";

export default function AddScheduleScreen({ route, navigation }) {
  const { medicineId } = route.params;

  const [frequency, setFrequency] = useState("");
  const [doseTimes, setDoseTimes] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [intervalHours, setIntervalHours] = useState("");
  const [startTime, setStartTime] = useState("");

  const frequencyOptions = [
    { label: "Once Daily", value: "once" },
    { label: "Twice Daily", value: "twice" },
    { label: "Thrice Daily", value: "thrice" },
    { label: "Every X Hours", value: "interval" },
  ];

  const getMaxDoses = () => {
      switch (frequency) {
        case "once":
          return 1;
        case "twice":
          return 2;
        case "thrice":
          return 3;
        default:
          return Infinity;
      }
    };

  const addTime = (event, time) => {
    setShowPicker(false);
    if (!time) return;

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const time24 = `${hours}:${minutes}`;

    const displayTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (frequency === "interval") {
      setStartTime(time24);
    } else {
      setDoseTimes((prev) => [...prev, time24]);
    }
  };

  const handleSave = async () => {
    if (!frequency) {
      Toast.show({ type: "error", text1: "Please select frequency" });
      return;
    }

    if (frequency === "interval") {
      if (!intervalHours || !startTime) {
        Toast.show({
          type: "error",
          text1: "Interval hours and start time required",
        });
        return;
      }
    } else {
      if (doseTimes.length === 0) {
        Toast.show({
          type: "error",
          text1: "Add at least one time",
        });
        return;
      }
    }

    console.log("Submitting:", {
      medicineId,
      frequency,
      intervalHours,
      startTime,
      doseTimes,
    });

    try {
      await api.post("/schedules", {
        medicine_id: medicineId,
        frequency,
        interval_hours:
          frequency === "interval" ? parseInt(intervalHours) : null,
        start_time:
          frequency === "interval"
            ? startTime
            : doseTimes[0],
        dose_times:
          frequency === "interval" ? [] : doseTimes,
      });

      Toast.show({
        type: "success",
        text1: "Schedule added successfully",
      });

      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to add schedule",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Dropdown
            style={styles.dropdown}
            data={frequencyOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Frequency"
            value={frequency}
            onChange={(item) => {
              setFrequency(item.value);
              setDoseTimes([]);
            }}
          />

          {frequency === "interval" ? (
            <>
              <TextInput
                label="Interval (Hours)"
                mode="outlined"
                keyboardType="numeric"
                value={intervalHours}
                onChangeText={setIntervalHours}
                style={styles.input}
                placeholder="e.g. 6"
              />

              <Button
                mode="outlined"
                onPress={() => setShowPicker(true)}
                style={styles.timeBtn}
              >
                Select Start Time
              </Button>

              {startTime !== "" && (
                <TextInput
                  label="Start Time"
                  mode="outlined"
                  value={startTime}
                  editable={false}
                  style={styles.input}
                />
              )}
            </>
          ) : (
            <>
              <Button
                mode="outlined"
                onPress={() => setShowPicker(true)}
                disabled={doseTimes.length >= getMaxDoses()}
              >
                Add Dose Time
              </Button>
                {doseTimes.map((time, index) => (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <TextInput
                      mode="outlined"
                      label={`Dose Time ${index + 1}`}
                      value={new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon="delete"
                          onPress={() =>
                            setDoseTimes(doseTimes.filter((_, i) => i !== index))
                          }
                        />
                      }
                    />
                  </View>
                ))}
            </>
          )}

          {showPicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={addTime}
            />
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveBtn}
          >
            Save Schedule
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f4f7fb",
  },
  card: {
    borderRadius: 16,
    padding: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  timeBtn: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 10,
  },
  saveBtn: {
    marginTop: 15,
  },
});