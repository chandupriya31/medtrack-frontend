import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Card, Text, Button, Divider } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import api from "../../api/api";

export default function DashboardScreen() {
  const isFocused = useIsFocused();

  const [activeMedicines, setActiveMedicines] = useState([]);
  const [todayDoses, setTodayDoses] = useState([]);
  const [endingToday, setEndingToday] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // full screen spinner
  const [updatingDoseId, setUpdatingDoseId] = useState(null); // disable buttons

  useEffect(() => {
    if (isFocused) {
      loadDashboard(true);
    }
  }, [isFocused]);

  const loadDashboard = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const res = await api.get("/dashboard");

      setActiveMedicines(res.data.activeMedicines || []);
      setTodayDoses(res.data.todayDoses || []);
      setEndingToday(res.data.endingToday || []);
    } catch (err) {
      console.log("Dashboard error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markDose = async (doseLogId, status) => {
    try {
      setUpdatingDoseId(doseLogId);

      const endpoint =
        status === "TAKEN"
          ? `/doses/taken/${doseLogId}`
          : `/doses/missed/${doseLogId}`;

      await api.put(endpoint);

      await loadDashboard();
    } catch (err) {
      console.log("Dose update failed:", err.response?.data || err.message);
    } finally {
      setUpdatingDoseId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 10 }}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={[]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadDashboard} />
      }
      ListHeaderComponent={
        <>
          {endingToday.length > 0 && (
            <Card style={[styles.sectionCard, styles.alertCard]}>
              <Card.Content>
                <Text style={styles.sectionHeader}>
                  Today's Medicine Ending
                </Text>
                {endingToday.map((m, index) => (
                  <Text key={index}>
                    • {m.medicine_name} — {m.patient_name}
                  </Text>
                ))}
              </Card.Content>
            </Card>
          )}

          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionHeader}>Active Medicines</Text>

              {activeMedicines.length === 0 && (
                <Text style={styles.emptyText}>No active medicines</Text>
              )}

              {activeMedicines.map((item) => (
                <View key={item.medicine_id} style={styles.innerItem}>
                  <Text style={styles.itemTitle}>{item.medicine_name}</Text>
                  <Text>Patient: {item.patient_name}</Text>
                  <Text>Ends on: {item.end_date}</Text>
                  <Divider style={{ marginVertical: 10 }} />
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Today's Reminders */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionHeader}>Today's Reminders</Text>

              {todayDoses.length === 0 && (
                <Text style={styles.emptyText}>No doses scheduled today</Text>
              )}

              {todayDoses
                .filter((dose) =>
                  ["PENDING", "NOTIFIED"].includes(dose.status)
                )
                .map((dose) => {
                  const isUpdating = updatingDoseId === dose.dose_log_id;

                  return (
                    <View key={dose.dose_log_id} style={styles.innerItem}>
                      <Text style={styles.itemTitle}>
                        {dose.medicine_name}
                      </Text>
                      <Text>Patient: {dose.patient_name}</Text>
                      <Text>Time: {dose.dose_time}</Text>

                      <View style={styles.buttonRow}>
                        <Button
                          mode="contained"
                          onPress={() =>
                            markDose(dose.dose_log_id, "TAKEN")
                          }
                          style={styles.takenBtn}
                          disabled={isUpdating}
                          loading={isUpdating}
                        >
                          Taken
                        </Button>

                        <Button
                          mode="outlined"
                          onPress={() =>
                            markDose(dose.dose_log_id, "MISSED")
                          }
                          disabled={isUpdating}
                        >
                          Missed
                        </Button>
                      </View>

                      <Text
                        style={[
                          styles.statusText,
                          dose.status === "NOTIFIED"
                            ? styles.notifiedText
                            : styles.pendingText,
                        ]}
                      >
                        Status: {dose.status}
                      </Text>

                      <Divider style={{ marginVertical: 10 }} />
                    </View>
                  );
                })}
            </Card.Content>
          </Card>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f9",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionCard: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    elevation: 5,
  },

  alertCard: {
    backgroundColor: "#fff3f3",
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  innerItem: {
    marginBottom: 5,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  takenBtn: {
    backgroundColor: "#4caf50",
  },

  statusText: {
    marginTop: 10,
    fontWeight: "bold",
  },

  pendingText: {
    color: "#1976d2",
  },

  notifiedText: {
    color: "#ff9800",
  },

  emptyText: {
    textAlign: "center",
    color: "gray",
  },
});