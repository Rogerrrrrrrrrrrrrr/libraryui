

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import BorrowService from "../api/BorrowService";

const BorrowedList = ({ userId, availableBooks }) => {
  const [borrowed, setBorrowed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBorrowed(); }, []);

  const fetchBorrowed = async () => {
    setLoading(true);
    try {
      const data = await BorrowService.getRecordsByUser(userId);
      setBorrowed(data);
    } catch (err) { console.error(err); Alert.alert("Error", "Failed to fetch borrowed books"); }
    finally { setLoading(false); }
  };

  const handleRequestReturn = async (recordId) => {
    try { await BorrowService.requestReturn(recordId); Alert.alert("Success", "Return request sent"); fetchBorrowed(); }
    catch (err) { console.error(err); Alert.alert("Error", "Failed to request return"); }
  };

  const handleRequestBorrow = async (bookId) => {
    try { await BorrowService.requestBorrow(userId, bookId); Alert.alert("Success", "Borrow request sent"); fetchBorrowed(); }
    catch (err) { console.error(err); Alert.alert("Error", "Failed to request borrow"); }
  };

  if (loading) return <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 My Borrowed Books</Text>

      <FlatList
        data={borrowed}
        keyExtractor={(item) => item.recordId.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.bookTitle}</Text>
            <Text style={styles.meta}>Status: {item.status}</Text>

            {item.status === "BORROWED" && (
              <TouchableOpacity style={styles.button} onPress={() => handleRequestReturn(item.recordId)}>
                <Text style={styles.buttonText}>Request Return</Text>
              </TouchableOpacity>
            )}

            {item.status === "AVAILABLE" && (
              <TouchableOpacity style={styles.button} onPress={() => handleRequestBorrow(item.bookId)}>
                <Text style={styles.buttonText}>Request Borrow</Text>
              </TouchableOpacity>
            )}

            {item.status.startsWith("PENDING") && (
              <Text style={{ marginTop: 8, fontStyle: "italic" }}>Request pending approval</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No borrowed books found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#0e5a64" },
  card: { padding: 16, borderRadius: 12, backgroundColor: "#fff", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  title: { fontSize: 16, fontWeight: "700", color: "#094852" },
  meta: { marginTop: 4, color: "#3a6871" },
  button: { marginTop: 12, backgroundColor: "#0b7285", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 20, color: "#666", fontSize: 16 },
});

export default BorrowedList;
