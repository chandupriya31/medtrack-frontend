import { FAB, Card, Button } from "react-native-paper";
import { StyleSheet, View, Text } from "react-native";

export default function MedicineDetailScreen({ route, navigation }) {
  const { medicine } = route.params;

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      timeZone: "UTC",
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={medicine.name} subtitle={medicine.dosage} />
        <Card.Content>
          <Text>Start: {formatDateOnly(medicine.start_date)}</Text>
          <Text>End: {formatDateOnly(medicine.end_date)}</Text>
          <Text>Duration: {medicine.duration || "N/A"} days</Text>
          <Text>Instructions: {medicine.instructions || "N/A"}</Text>

          <Button
            mode="contained"
            onPress={() =>
              navigation.navigate("Schedules", {
                medicineId: medicine.medicine_id,
              })
            }
          >
            View Schedule
          </Button>
        </Card.Content>
      </Card>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() =>
          navigation.navigate("AddSchedule", {
            medicineId: medicine.medicine_id,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f7fb" },
  card: { borderRadius: 12, padding: 10 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#777",
  },
});
