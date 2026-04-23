import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Card, FAB, IconButton } from "react-native-paper";
import api from "../../api/api";

export default function PatientListScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/patient");
      console.log(res.data);
      setPatients(res.data || []);
    } catch (err) {
      console.log(
        "Error fetching patients:",
        err.response?.data || err.message,
      );

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch patients",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, []),
  );

const deletePatient = async (id) => {
  if (!id) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Invalid patient ID",
    });
    return;
  }

  try {
    setRefreshing(true);

    await api.delete(`/patient/${id}`);
    await fetchPatients();

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Patient deleted successfully",
    });
  } catch (err) {
    console.log("Delete error:", err.response?.data || err.message);

    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Delete failed",
    });
  } finally {
    setRefreshing(false);
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f7fb" }}>
      <FlatList
        data={patients}
        keyExtractor={(item) => item.patient_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPatients} />
        }
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: "gray",
              fontSize: 16,
            }}
          >
            No patients found.
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={{ margin: 12, borderRadius: 10 }}>
            <Card.Content>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("PatientDetail", {
                    patient: item,
                  })
                }
              >
                <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                  {item.name}
                </Text>
                <Text>Age: {item.age}</Text>
                <Text>Phone: {item.phone_number}</Text>
              </TouchableOpacity>
            </Card.Content>

            <Card.Actions style={{ justifyContent: "flex-end" }}>
              <IconButton
                icon="pencil"
                onPress={() =>
                  navigation.navigate("AddPatient", {
                    patient: item,
                  })
                }
              />
              <IconButton
                icon="delete"
                iconColor="red"
                onPress={() => deletePatient(item.patient_id)}
              />
            </Card.Actions>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#2E7D32",
        }}
        onPress={() => navigation.navigate("AddPatient")}
      />
    </View>
  );
}