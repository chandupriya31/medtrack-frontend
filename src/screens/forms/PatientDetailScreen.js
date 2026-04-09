import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Card, FAB } from "react-native-paper";
import api from "../../api/api";

export default function PatientDetailScreen({ route, navigation }) {
  const { patient } = route.params;
  const [medicines, setMedicines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMedicines = async () => {
    try {
      setRefreshing(true);
      const res = await api.get(`/medicines/patient/${patient.patient_id}`);
      setMedicines(res.data || []);
    } catch (err) {
      console.log(
        "Error fetching medicines:",
        err.response?.data || err.message,
      );
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
    }, []),
  );

  const getStatusColor = (status, end_date) => {
    if (status === "active") return "#E8F5E9";
    if (status === "completed") return "#ECEFF1";
    return new Date(end_date) >= new Date() ? "#E8F5E9" : "#ECEFF1";
  };

  return (
    <View style={styles.container}>
      <Card style={styles.patientCard}>
        <Card.Title title={patient.name} subtitle={`Age: ${patient.age}`} />
        <Card.Content>
          <Text style={styles.infoText}>
            Phone Number: {patient.phone_number || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            Medical Condition: {patient.medical_condition || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            Doctor: {patient.doctor_name || "N/A"}
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item.medicine_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchMedicines} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No medicines added for this patient.
          </Text>
        }
        renderItem={({ item }) => (
          <Card
            style={[
              styles.medicineCard,
              {
                backgroundColor: getStatusColor(item.status, item.end_date),
              },
            ]}
          >
            <Card.Title
              title={item.name}
              subtitle={`${item.dosage} • ${item.frequency}`}
            />
            <Card.Content>
              <Text>
                {item.start_date} → {item.end_date}
              </Text>
              {item.instructions && (
                <Text>Instructions: {item.instructions}</Text>
              )}
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
    padding: 15,
  },
  patientCard: {
    marginBottom: 15,
    borderRadius: 12,
  },
  medicineCard: {
    marginBottom: 10,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#2E7D32",
  },
});
