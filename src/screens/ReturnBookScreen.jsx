import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import BorrowService from "../api/BorrowService";

const PAGE_SIZE = 8;

const ReturnBookScreen = ({ route }) => {
  const { role, userId } = route.params || {}; 

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let allRecords = [];

      if (role === "admin") {
    const pending = await BorrowService.getPendingBorrows();
    allRecords = Array.isArray(pending) ? pending : [];
} else {
    const userRecords = await BorrowService.getRecordsByUser(userId);
    allRecords = Array.isArray(userRecords) ? userRecords : [];
}

      const pendingBooks = allRecords.filter((b) => !b.returnDate);
      setRecords(pendingBooks);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch borrowed books.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

 const handleReturn = (record) => {
  console.log("⚡ Sending return request for record:", record);

  Alert.alert(
    "Confirm Return Request",
    `Send return request for "${record.bookTitle}"? Admin will approve it.`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: async () => {
          try {
            setLoading(true);
            const response = await BorrowService.requestReturn(record.recordId);
            console.log("📌 Return request response:", response);

            setRecords((prev) =>
              prev.map((r) =>
                r.recordId === record.recordId
                  ? { ...r, status: "PENDING_RETURN" }
                  : r
              )
            );

            Alert.alert(
              "Request Sent",
              `"${record.bookTitle}" return request sent. Waiting admin approval.`
            );
          } catch (err) {
            console.error("⚠️ Error sending return request:", err);
            Alert.alert("Error", "Failed to send return request.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
};



  const filtered = records.filter((r) => {
    if (!debouncedSearch) return true;
    const s = debouncedSearch;
    return (
      (r.bookTitle?.toLowerCase() || "").includes(s) ||
      (r.userName?.toLowerCase() || "").includes(s) ||
      (r.userEmail?.toLowerCase() || "").includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  if (loading)
    return <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📖 Return Borrowed Books</Text>

      <TextInput
        placeholder="Search by book or user"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>No borrowed books available for return.</Text>
        </View>
      ) : (
        <FlatList
          data={paginated}
          keyExtractor={(item) => String(item.recordId ?? Math.random())}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.book}>{item.bookTitle || "No Title"}</Text>
              </View>
              {role === "admin" && (
                <Text style={styles.meta}>
                  User: <Text style={styles.user}>{item.userName || "Unknown"}</Text>
                </Text>
              )}
              <Text style={styles.meta}>
                Issued: {item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "-"}
              </Text>

              {!item.returnDate && item.status !== "PENDING_RETURN" && (
  <TouchableOpacity
    style={styles.returnBtn}
    onPress={() => handleReturn(item)}
  >
    <Text style={styles.returnText}>Return</Text>
  </TouchableOpacity>
)}

{item.status === "PENDING_RETURN" && (
  <View style={[styles.returnBtn, { backgroundColor: "#f39c12" }]}>
    <Text style={styles.returnPendingText}>Return Pending</Text>
  </View>
)}

            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {records.length > 0 && (
        <View style={styles.pager}>
          <TouchableOpacity
            disabled={pageSafe <= 1}
            onPress={() => setPage(pageSafe - 1)}
            style={[styles.pageBtn, pageSafe <= 1 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            Page {pageSafe} / {totalPages}
          </Text>
          <TouchableOpacity
            disabled={pageSafe >= totalPages}
            onPress={() => setPage(pageSafe + 1)}
            style={[styles.pageBtn, pageSafe >= totalPages && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ReturnBookScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#0e5a64" },
  search: {
    borderWidth: 1,
    borderColor: "#d9eef2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  book: { fontWeight: "700", fontSize: 17, color: "#094852", marginBottom: 4 },
  meta: { color: "#3a6871", marginTop: 2 },
  user: { fontWeight: "600", color: "#0b7285" },
  returnBtn: {
    marginTop: 12,
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  returnText: { color: "#fff", fontWeight: "700" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#7a8a91", fontStyle: "italic", textAlign: "center", paddingHorizontal: 20 },
  pager: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  pageBtn: { padding: 10, backgroundColor: "#0b7285", borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: "#9ecad3" },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontWeight: "700", color: "#0e5a64" },
  returnPendingText: { color: "#fff", fontWeight: "700" }

});
