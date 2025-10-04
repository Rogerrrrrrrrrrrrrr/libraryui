import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { removeToken, getUserData } from "../utils/storage";

const UserDashboard = ({ navigation }) => {
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserData(); 
        console.log("📌 [UserDashboard] fetched userData from storage:", data);

        const normalizedData = {
          role: data?.role?.toLowerCase() || "student",
          userId: data?.userId || null,
        };

        console.log("📌 [UserDashboard] normalized userData:", normalizedData);
        setUserData(normalizedData);
      } catch (err) {
        console.error("⚠️ [UserDashboard] error fetching user data:", err);
        setUserData({ role: "student", userId: null });
      }
    };
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
    if (!userData) {
      console.warn("⚠️ [UserDashboard] userData not loaded yet, cannot navigate");
      return;
    }
    if (!userData.userId) {
      console.warn("⚠️ [UserDashboard] userId not available yet, cannot navigate");
      return;
    }
    console.log(`➡️ [UserDashboard] navigating to ${screen} with params:`, userData);
    navigation.navigate(screen, { role: userData.role, userId: userData.userId });
  };

  if (!userData || !userData.userId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0b7285" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading user...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#f6d365", "#fda085"]} style={styles.container}>
      <Text style={styles.title}>👤 User Dashboard</Text>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#a1c4fd", "#c2e9fb"]} style={styles.gradientBtn}>
              <Text style={styles.menuText}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 30 },
  menuContainer: { width: "100%", alignItems: "center" },
  menuCard: { width: "80%", marginVertical: 10, borderRadius: 14, overflow: "hidden", elevation: 5 },
  gradientBtn: { paddingVertical: 16, alignItems: "center" },
  menuText: { fontSize: 18, fontWeight: "700", color: "#0e5a64" },
  logoutCard: { width: "80%", marginTop: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: "#ff6b6b", alignItems: "center", elevation: 5 },
  logoutText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});

export default UserDashboard;
