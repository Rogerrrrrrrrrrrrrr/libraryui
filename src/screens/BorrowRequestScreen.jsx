import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import BorrowService from "../api/BorrowService";

const BorrowRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await BorrowService.getAllBorrowed();
      const pending = data.filter(r => r.status === "PENDING_BORROW" || r.status === "PENDING_RETURN");
      setRequests(pending);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBorrow = async (recordId) => {
    try {
      await BorrowService.approveBorrow(recordId);
      Alert.alert("Success", "Borrow approved");
      fetchRequests();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to approve borrow");
    }
  };

  const handleApproveReturn = async (recordId) => {
    try {
      await BorrowService.approveReturn(recordId);
      Alert.alert("Success", "Return approved");
      fetchRequests();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to approve return");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📄 Pending Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.recordId.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.bookTitle}</Text>
            <Text style={styles.meta}>User: {item.userName}</Text>
            <Text style={styles.meta}>Status: {item.status}</Text>

            {item.status === "PENDING_BORROW" && (
              <TouchableOpacity style={styles.button} onPress={() => handleApproveBorrow(item.recordId)}>
                <Text style={styles.buttonText}>Approve Borrow</Text>
              </TouchableOpacity>
            )}

            {item.status === "PENDING_RETURN" && (
              <TouchableOpacity style={styles.button} onPress={() => handleApproveReturn(item.recordId)}>
                <Text style={styles.buttonText}>Approve Return</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No pending requests</Text>}
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

export default BorrowRequestsScreen;
