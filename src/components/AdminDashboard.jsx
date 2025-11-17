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



import React, { useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { removeToken } from "../utils/storage";
import Icon from "react-native-vector-icons/Ionicons";
import { Colors } from "../styles/theme";
import MaskedView from "@react-native-masked-view/masked-view";

const AdminDashboard = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const menuItems = [
    { title: "Manage Books", screen: "Books", icon: "book-outline", colors: ["#43cea2", "#185a9d"] },
    { title: "Manage Users", screen: "Users", icon: "people-outline", colors: ["#ff6a00", "#ee0979"] },
    { title: "Pending Requests", screen: "PendingRequestsScreen", icon: "time-outline", colors: ["#f7971e", "#ffd200"] },
    { title: "Borrowed History", screen: "BorrowHistory", icon: "time-outline", colors: ["#ff512f", "#dd2476"] },
  ];

  const handleLogout = async () => {
    await removeToken();
    navigation.replace("Login");
  };

  return (
    <LinearGradient
      colors={[Colors.secondary, Colors.secondaryDark]}
      style={styles.container}
    >
      <MaskedView
  maskElement={
    <Text style={styles.title}>📚 Admin Dashboard</Text>
  }
>
  <LinearGradient
    colors={["#dee7e7ff", "#4facfe"]} 
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <Text style={[styles.title, { opacity: 0 }]}>📚 Admin Dashboard</Text>
  </LinearGradient>
</MaskedView>


      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cardWrapper}
            onPress={() =>
              navigation.navigate(item.screen, item.screen === "BorrowHistory" ? { role: "admin" } : undefined)
            }
            activeOpacity={0.85}
          >
            <LinearGradient colors={item.colors} style={styles.menuCard}>
              <Icon name={item.icon} size={24} color="#fff" style={styles.icon} />
              <Text style={styles.cardText}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cardWrapper} onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient colors={["#c31432", "#240b36"]} style={styles.menuCard}>
            <Icon name="log-out-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.cardText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  menuContainer: { alignItems: "center" },
  cardWrapper: {
    width: "90%",
    marginBottom: 18,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  icon: { marginRight: 14 },
  cardText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});

export default AdminDashboard;



