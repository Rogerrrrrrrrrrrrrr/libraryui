import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { removeToken, getUserData } from "../utils/storage";
import { useFocusEffect, useRoute } from "@react-navigation/native";

const UserDashboard = ({ navigation }) => {
  const [userData, setUserData] = React.useState(null);
  const route = useRoute();

  // ✅ Fetch user data (used both on mount and refresh)
  const fetchUser = async () => {
    try {
      const data = await getUserData();
      setUserData({
        role: data?.role?.toLowerCase() || "student",
        userId: data?.userId || null,
        name: data?.name || "",
        email: data?.email || "",
      });
    } catch (err) {
      console.error(err);
      setUserData({ role: "student", userId: null });
    }
  };

  // ✅ Re-run fetchUser when coming back with refresh param
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refresh) {
        fetchUser();
        // reset the refresh flag to avoid infinite loops
        navigation.setParams({ refresh: false });
      }
    }, [route.params?.refresh])
  );

  // Initial fetch
  React.useEffect(() => {
    fetchUser();
  }, []);

  const menuItems = [
    { title: "📕 Borrow Book", screen: "BorrowBook" },
    { title: "📗 Return Book", screen: "ReturnBook" },
    { title: "📘 Borrow History", screen: "BorrowHistory" },
    { title: "👤 Manage Profile", screen: "Users" },
  ];

  const handleLogout = async () => {
    await removeToken();
    navigation.replace("Login");
  };

  const handleNavigate = (screen) => {
    if (!userData || !userData.userId) return;
    navigation.navigate(screen, { role: userData.role, userId: userData.userId });
  };

  if (!userData || !userData.userId) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loaderText}>Loading user...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <Text style={styles.title}>👤 {userData.name || "User"} Dashboard</Text>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#89f7fe", "#66a6ff"]} style={styles.gradientBtn}>
              <Text style={styles.menuText}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient colors={["#ff758c", "#ff7eb3"]} style={styles.gradientLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#667eea" },
  loaderText: { marginTop: 10, color: "#fff", fontSize: 16 },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 40,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  menuContainer: { width: "100%", alignItems: "center" },
  menuCard: {
    width: "85%",
    marginVertical: 12,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  gradientBtn: { paddingVertical: 18, alignItems: "center", borderRadius: 20 },
  menuText: { fontSize: 20, fontWeight: "700", color: "#0b1f3f" },
  logoutCard: { width: "85%", marginTop: 25, borderRadius: 20, overflow: "hidden", elevation: 5 },
  gradientLogout: { paddingVertical: 18, alignItems: "center", borderRadius: 20 },
  logoutText: { fontSize: 20, fontWeight: "700", color: "#fff" },
});

export default UserDashboard;
