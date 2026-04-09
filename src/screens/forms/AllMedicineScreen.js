import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import { Card, FAB } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import api from "../../api/api";

export default function AllMedicinesScreen({ navigation }) {
  const [medicines, setMedicines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchMedicines();
    }
  }, [isFocused]);

  const fetchMedicines = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/medicines");
      console.log(res.data)
      setMedicines(res.data || []);
    } catch (err) {
      console.log("Medicine fetch error:", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.medicine_id?.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchMedicines} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No medicines added yet.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MedicineDetail", { medicine: item })
            }
          >
            <Card style={styles.card}>
              <Card.Title
                title={item.name}
                subtitle={`${item.dosage}`}
              />
            </Card>
          </TouchableOpacity>
        )}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("AddMedicine")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fb" },
  card: { marginHorizontal: 15, marginVertical: 8, borderRadius: 12 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#2E7D32",
  },
  empty: { textAlign: "center", marginTop: 40, color: "gray", fontSize: 16 },
});
