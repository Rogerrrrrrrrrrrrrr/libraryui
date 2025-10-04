// const AdminDashboard = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>📚 Admin Dashboard</Text>

//       <View style={styles.menu}>
//         <Button
//           title="📖 Manage Books"
//           onPress={() => navigation.navigate("Books")}
//         />
//       </View>

//       <View style={styles.menu}>
//         <Button
//           title="👤 Manage Users"
//           onPress={() => navigation.navigate("Users")}
//         />
//       </View>

//       {/* Borrow Records */}
//       {/* <View style={styles.menu}>
//         <Button
//           title="📕 Borrow Book"
//           onPress={() => navigation.navigate("BorrowBook")}
//         />
//       </View>

//       <View style={styles.menu}>
//         <Button
//           title="📗 Return Book"
//           onPress={() => navigation.navigate("ReturnBook")}
//         />
//       </View>

//       <View style={styles.menu}>
//         <Button
//           title="📘 Borrow History"
//           onPress={() => navigation.navigate("BorrowHistory")}
//         />
//       </View> */}

      
//       <View style={styles.menu}>
//       <Button title="📕 Borrow Book" onPress={() => navigation.navigate("BorrowBook")} />
//       </View>
//       <View style={styles.menu}>
//         <Button title="📘 Borrow History" onPress={() => navigation.navigate("BorrowHistory")} />
//         </View>
//       <View style={styles.menu}>
//         <Button title="📗 Return Book" onPress={() => navigation.navigate("ReturnBook")} />
//         </View>
      
//           <View style={styles.menu}>
//         <Button
//           color="red"
//           title="🚪 Logout"
//           onPress={() => navigation.replace("Login")}
//         />
//       </View>
//     </View>
//   );
// };



import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { removeToken } from "../utils/storage";
import Icon from "react-native-vector-icons/Ionicons";
import { Colors } from "../styles/theme";

const AdminDashboard = ({ navigation }) => {
  const menuItems = [
    { title: "Manage Books", screen: "Books", icon: "book-outline", colors: ["#43cea2", "#185a9d"] },
    { title: "Manage Users", screen: "Users", icon: "people-outline", colors: ["#ff6a00", "#ee0979"] },
    { title: "Pending Requests", screen: "PendingRequestsScreen", icon: "time-outline", colors: ["#ff9966", "#ff5e62"] },
    { title: "Borrowed History", screen: "BorrowHistory", icon: "time-outline", colors: ["#36d1dc", "#5b86e5"] },
  ];

  const handleLogout = async () => {
    await removeToken();
    navigation.replace("Login");
  };

  return (
    <LinearGradient
      colors={[Colors.secondary, Colors.secondaryDark]}
      style={{ flex: 1, padding: 20, justifyContent: "center" }}
    >
      <Text style={styles.header}>📚 Admin Dashboard</Text>

      <View style={{ alignItems: "center" }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cardWrapper}
            onPress={() => {
              if (item.screen === "BorrowHistory") {
                navigation.navigate(item.screen, { role: "admin" });
              } else {
                navigation.navigate(item.screen);
              }
            }}
            activeOpacity={0.9}
          >
            <LinearGradient colors={item.colors} style={styles.menuCard}>
              <Icon name={item.icon} size={28} color="#fff" style={styles.icon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cardWrapper} onPress={handleLogout} activeOpacity={0.9}>
          <LinearGradient colors={["#f12711", "#f5af19"]} style={styles.menuCard}>
            <Icon name="log-out-outline" size={28} color="#fff" style={styles.icon} />
            <Text style={styles.menuText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1,
  },
  cardWrapper: {
    width: "92%",
    marginBottom: 18,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 18,
  },
  icon: { marginRight: 14 },
  menuText: { color: "#fff", fontSize: 19, fontWeight: "600" },
});

export default AdminDashboard;


