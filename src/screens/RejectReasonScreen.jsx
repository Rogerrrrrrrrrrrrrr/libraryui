import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from "react-native";
import BorrowService from "../api/BorrowService";

const rejectReasons = ["User not eligible", "Book damaged", "Other reason"];

const RejectReasonScreen = ({ route, navigation }) => {
  const { record } = route.params;
  const [selectedReason, setSelectedReason] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!selectedReason) {
      Alert.alert("Select Reason", "Please select a reason to reject.");
      return;
    }
    try {
      setLoading(true);
      const response = record.type === "borrow"
        ? await BorrowService.rejectBorrow(record.recordId)
        : await BorrowService.rejectReturn(record.recordId);

      Alert.alert("Request Rejected", `${response.message}\nReason: ${selectedReason}`);

      navigation.goBack(); 
    } catch (err) {
      console.error("Reject error:", err);
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reject {record.type === "borrow" ? "Borrow" : "Return"} Request</Text>
      <Text style={styles.subHeader}>Book: {record.bookTitle}</Text>
      <Text style={styles.subHeader}>User: {record.userName}</Text>

      <Text style={styles.selectLabel}>Select Reason:</Text>
      <FlatList
        data={rejectReasons}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.reasonBtn, selectedReason === item && styles.selectedReasonBtn]}
            onPress={() => setSelectedReason(item)}
          >
            <Text style={[styles.reasonText, selectedReason === item && styles.selectedReasonText]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[styles.rejectBtn, loading && styles.disabledBtn]}
        onPress={handleReject}
        disabled={loading}
      >
        <Text style={styles.rejectText}>{loading ? "Rejecting..." : "Reject Request"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: "#0e5a64" },
  subHeader: { fontSize: 16, marginBottom: 6, color: "#3a6871" },
  selectLabel: { fontSize: 16, marginTop: 12, marginBottom: 8, fontWeight: "600" },
  reasonBtn: { padding: 12, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#d9eef2", marginBottom: 8 },
  selectedReasonBtn: { backgroundColor: "#0b7285", borderColor: "#0b7285" },
  reasonText: { color: "#0b7285", fontWeight: "600", textAlign: "center" },
  selectedReasonText: { color: "#fff" },
  rejectBtn: { marginTop: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: "#e74c3c", alignItems: "center" },
  rejectText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  disabledBtn: { backgroundColor: "#9ecad3" },
});

export default RejectReasonScreen;
