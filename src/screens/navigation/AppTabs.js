import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/authSlice";

import DashboardScreen from "../forms/DashboardScreen";
import PatientListScreen from "../forms/PatientListScreen";
import AddPatientScreen from "../forms/AddPatientScreen";
import PatientDetailScreen from "../forms/PatientDetailScreen";
import AllMedicineScreen from "../forms/AllMedicineScreen";
import AddMedicineScreen from "../forms/AddMedicineScreen";
import MedicineDetailScreen from "../forms/MedicineDetailScreen";
import ScheduleList from "../forms/ScheduleList";
import AddScheduleScreen from "../forms/AddScheduleScreen";
import HistoryScreen from "../forms/HistoryScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Mini stack for Patients
function PatientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="PatientList" component={PatientListScreen} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
    </Stack.Navigator>
  );
}

// Mini stack for Medicines
function MedicineStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AllMedicines" component={AllMedicineScreen} />
      <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
      <Stack.Screen name="Schedules" component={ScheduleList} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

// Main Tabs
export default function AppTabs() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#777",
        tabBarInactiveTintColor: "#777",
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = focused ? "grid" : "grid-outline";
          else if (route.name === "Patients") iconName = focused ? "people" : "people-outline";
          else if (route.name === "Medicines") iconName = focused ? "medkit" : "medkit-outline";
          else if (route.name === "History") iconName = focused ? "time" : "time-outline";
          else if (route.name === "Logout") iconName = "exit-outline";
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Patients" component={PatientStack} />
      <Tab.Screen name="Medicines" component={MedicineStack} />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen
        name="Logout"
        component={DashboardStack} // dummy
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity {...props} onPress={handleLogout} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}