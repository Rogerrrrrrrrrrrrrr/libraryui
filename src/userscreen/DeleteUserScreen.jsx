import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import UserService from "../api/UserService";

const DeleteUserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await UserService.getUserById(userId);
        setUser(userData);
      } catch (error) {
        Alert.alert("Error", "Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

 const handleDelete = async () => {
  try {
    await UserService.deleteUser(userId);
    Alert.alert("✅ User Deleted", `User ${user?.name || ""} has been deleted.`, [
      {
        text: "OK",
        onPress: () => navigation.replace("Users", { refresh: true }), 
      },
    ]);
  } catch (error) {
    console.error("Delete error:", error.message);
    Alert.alert("Error", "Failed to delete user.");
  }
};


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#fab1a0", "#e17055"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Icon name="alert-circle-outline" size={60} color="#d63031" style={{ marginBottom: 15 }} />
          <Text style={styles.title}>Delete User</Text>
          <Text style={styles.text}>Are you sure you want to delete this user?</Text>
          <Text style={styles.userInfo}>
            {user.name} ({user.email}) - Role: {user.role}
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={["#b2bec3", "#636e72"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnGradient}
              >
                <Icon name="close-outline" size={18} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.btnText}>Cancel</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={["#d63031", "#e84118"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnGradient}
              >
                <Icon name="trash-outline" size={18} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.btnText}>Delete</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#2d3436" },
  text: { fontSize: 16, textAlign: "center", marginBottom: 10, color: "#2d3436" },
  userInfo: { fontSize: 16, fontWeight: "600", marginBottom: 25, color: "#2d3436" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  cancelBtn: { flex: 1, marginRight: 10, borderRadius: 30, overflow: "hidden" },
  deleteBtn: { flex: 1, marginLeft: 10, borderRadius: 30, overflow: "hidden" },
  btnGradient: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderRadius: 30 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
};

export default DeleteUserScreen;
