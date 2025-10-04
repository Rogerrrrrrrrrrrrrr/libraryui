// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import BorrowedList from "./BorrowedList";
// import BookList from "./BookList"; // you’ll provide me existing one later

// const BorrowReturn = () => {
//   const [tab, setTab] = useState("borrow");

//   return (
//     <View style={styles.container}>
//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, tab === "borrow" && styles.activeTab]}
//           onPress={() => setTab("borrow")}
//         >
//           <Text style={styles.tabText}>📖 Borrow</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, tab === "return" && styles.activeTab]}
//           onPress={() => setTab("return")}
//         >
//           <Text style={styles.tabText}>↩ Return</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Content */}
//       <View style={styles.content}>
//         {tab === "borrow" ? <BookList /> : <BorrowedList />}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 10 },
//   tabContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 10,
//   },
//   tab: {
//     flex: 1,
//     padding: 12,
//     alignItems: "center",
//     borderBottomWidth: 2,
//     borderBottomColor: "#ccc",
//   },
//   activeTab: {
//     borderBottomColor: "blue",
//   },
//   tabText: { fontSize: 16, fontWeight: "bold" },
//   content: { flex: 1 },
// });

// export default BorrowReturn;
