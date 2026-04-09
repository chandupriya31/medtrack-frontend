import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { Card, FAB } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api/api";

export default function ScheduleList({ route, navigation }) {
  const medicineId = route?.params?.medicineId || null;
  const [schedules, setSchedules] = useState([]);

  const loadSchedules = async () => {
    try {
      if (!medicineId) return;
      const res = await api.get(`/schedules/medicine/${medicineId}`);
      console.log('response from schedules', res.data)
      setSchedules(res.data || []);
    } catch (err) {
      console.log(err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [medicineId])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.schedule_id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No schedules added yet.
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>
                Frequency: {item.frequency}
              </Text>

              {item.times?.map((t) => (
                <Text key={t.schedule_time_id}>
                  • {t.dose_time}
                </Text>
              ))}
            </Card.Content>
          </Card>
        )}
      />

      {medicineId && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() =>
            navigation.navigate("AddSchedule", { medicineId })
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f7fb" },
  card: { marginBottom: 12, borderRadius: 12 },
  empty: { textAlign: "center", marginTop: 40, color: "gray" },
  title: { fontWeight: "600", marginBottom: 6 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#2E7D32",
  },
});