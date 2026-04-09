import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import {
  Card,
  Divider,
  Chip,
  Text,
  Menu,
  Button,
  ProgressBar,
} from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import api from "../../api/api";

export default function HistoryScreen() {
  const [completed, setCompleted] = useState([]);
  const [missed, setMissed] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchPatients();
      fetchHistory();
    }
  }, [isFocused]);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patient");
      setPatients(res.data || []);
    } catch (err) {
      console.log("Patient fetch error:", err.message);
    }
  };

  const fetchHistory = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/history");

      setCompleted(res.data?.completed || []);
      setMissed(res.data?.missed || []);
      setSelectedPatient(null);
    } catch (err) {
      console.log("History error:", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const loadPatientHistory = async (id, name) => {
    try {
      setMenuVisible(false);
      setSelectedPatient(name);
      setRefreshing(true);

      const res = await api.get(`/history/patient/${id}`);

      setCompleted(res.data?.completed || []);
      setMissed(res.data?.missed || []);
    } catch (err) {
      console.log("Patient history error:", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const totalDoses = completed.length + missed.length;

  const adherence =
    totalDoses === 0 ? 0 : Math.round((completed.length / totalDoses) * 100);

  const progressColor =
    adherence >= 80 ? "#4caf50" : adherence >= 50 ? "#ff9800" : "#e53935";

  const renderCompletedItem = ({ item }) => (
    <Card style={[styles.card, styles.completedCard]}>
      <Card.Title
        title={item.medicine_name}
        subtitle={`Patient: ${item.patient_name}`}
      />
      <Card.Content>
        <Text>Date: {item.dose_date}</Text>
        <Text>Time: {item.dose_time}</Text>
        <Chip style={styles.takenChip}>Taken</Chip>
      </Card.Content>
    </Card>
  );

  const renderMissedItem = (dose, index) => (
    <Card
      key={(dose?.dose_id || dose?.id || dose?.history_id || index).toString()}
      style={[styles.card, styles.missedCard]}
    >
      <Card.Title
        title={dose.medicine_name}
        subtitle={`Patient: ${dose.patient_name}`}
      />
      <Card.Content>
        <Text>Date: {dose.dose_date}</Text>
        <Text>Time: {dose.dose_time}</Text>
        <Chip style={styles.missedChip}>Missed</Chip>
      </Card.Content>
    </Card>
  );

  const safeKeyExtractor = (item, index) =>
    item?.dose_id?.toString() ||
    item?.id?.toString() ||
    item?.history_id?.toString() ||
    index.toString();

  return (
    <FlatList
      style={styles.container}
      data={completed}
      keyExtractor={safeKeyExtractor}
      renderItem={renderCompletedItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            if (selectedPatient) {
              const patient = patients.find((p) => p.name === selectedPatient);
              if (patient) {
                loadPatientHistory(patient.patient_id, patient.name);
              }
            } else {
              fetchHistory();
            }
          }}
        />
      }
      ListHeaderComponent={
        <>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={{ marginBottom: 15 }}
              >
                {selectedPatient || "Filter by Patient"}
              </Button>
            }
          >
            <Menu.Item onPress={fetchHistory} title="All Patients" />
            {patients.map((p) => (
              <Menu.Item
                key={p.patient_id?.toString()}
                onPress={() => loadPatientHistory(p.patient_id, p.name)}
                title={p.name}
              />
            ))}
          </Menu>

          <Card style={styles.adherenceCard}>
            <Card.Content>
              <Text style={styles.adherenceTitle}>Medication Adherence</Text>

              <Text style={styles.adherencePercent}>{adherence}%</Text>

              <ProgressBar
                progress={adherence / 100}
                color={progressColor}
                style={styles.progressBar}
              />
            </Card.Content>
          </Card>

          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, styles.totalSummary]}>
              <Card.Content>
                <Text style={styles.summaryNumber}>{totalDoses}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, styles.completedSummary]}>
              <Card.Content>
                <Text style={styles.summaryNumber}>{completed.length}</Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, styles.missedSummary]}>
              <Card.Content>
                <Text style={styles.summaryNumber}>{missed.length}</Text>
                <Text style={styles.summaryLabel}>Missed</Text>
              </Card.Content>
            </Card>
          </View>

          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Completed Doses</Text>
        </>
      }
      ListFooterComponent={
        <>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Missed Doses</Text>

          {missed.length === 0 ? (
            <Text style={styles.emptyText}>No missed doses</Text>
          ) : (
            missed.map(renderMissedItem)
          )}
        </>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          No medication history available yet.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f4f6f9",
  },

  adherenceCard: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    elevation: 3,
  },

  adherenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  adherencePercent: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  progressBar: {
    height: 10,
    borderRadius: 10,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 12,
  },

  totalSummary: { backgroundColor: "#e3f2fd" },
  completedSummary: { backgroundColor: "#e8f5e9" },
  missedSummary: { backgroundColor: "#ffebee" },

  summaryNumber: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },

  summaryLabel: {
    textAlign: "center",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
  },

  divider: {
    marginVertical: 15,
  },

  card: {
    marginBottom: 12,
    borderRadius: 12,
  },

  completedCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#2e7d32",
  },

  missedCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#e53935",
  },

  takenChip: {
    backgroundColor: "#c8e6c9",
    marginTop: 8,
  },

  missedChip: {
    backgroundColor: "#ffcdd2",
    marginTop: 8,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
});
