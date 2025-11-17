import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert, RefreshControl
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
        // Admin fetches all pending borrow/return requests (if needed)
        const pending = await BorrowService.getPendingBorrows();
        allRecords = Array.isArray(pending) ? pending : [];
      } else {
        // User fetches only their borrowed books
        const userRecords = await BorrowService.getRecordsByUser(userId);
        allRecords = Array.isArray(userRecords) ? userRecords : [];
      }

      const pendingBooks = allRecords.filter(
        (b) =>
          !b.returnDate &&
          (b.status === "BORROWED" ||
           b.status === "RETURN_REJECTED" ||
           b.status === "PENDING_RETURN")
      );
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
  
              // ✅ Show immediate feedback
              Alert.alert(
                "Request Sent",
                `"${record.bookTitle}" return request sent. Waiting admin approval.`
              );
  
              // ✅ Refresh records list to reflect latest data
              await fetchRecords();
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
  

  // 🔍 Search logic simplified — only filters by book title
  const filtered = records.filter((r) => {
    if (!debouncedSearch) return true;
    const s = debouncedSearch;
    return (r.bookTitle?.toLowerCase() || "").includes(s);
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
        placeholder="Search by book title"
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
          renderItem={({ item }) => {
            const issued = item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "-";
            const returnReq = item.returnRequestDate ? new Date(item.returnRequestDate).toLocaleDateString() : null;
            const returnReject = item.returnRejectDate ? new Date(item.returnRejectDate).toLocaleDateString() : null;
            const returned = item.returnDate ? new Date(item.returnDate).toLocaleDateString() : null;
          
            const getStatusStyle = () => {
              switch (item.status) {
                case "PENDING_RETURN":
                  return { label: "Pending Return", color: "#f39c12" };
                case "RETURN_REJECTED":
                  return { label: "Return Rejected", color: "#e74c3c" };
                case "RETURNED":
                  return { label: "Returned", color: "#27ae60" };
                case "BORROWED":
                default:
                  return { label: "Borrowed", color: "#3498db" };
              }
            };
          
            const { label, color } = getStatusStyle();
          
            return (
              <View style={styles.card}>
                {/* 📚 Title and Status Chip */}
                <View style={styles.cardHeaderVertical}>
                  <Text style={styles.book}>{item.bookTitle || "No Title"}</Text>
                  <View style={[styles.statusChip, { backgroundColor: color }]}>
                    <Text style={styles.statusText}>{label}</Text>
                  </View>
                </View>
          
                <Text style={styles.meta}>Issued: {issued}</Text>
          
                {item.status === "PENDING_RETURN" && returnReq && (
                  <Text style={styles.meta}>Return Request Date: {returnReq}</Text>
                )}
          
                {item.status === "RETURN_REJECTED" && returnReject && (
                  <Text style={styles.meta}>Return Rejected Date: {returnReject}</Text>
                )}
          
                {item.status === "RETURNED" && returned && (
                  <Text style={[styles.meta, { color: "#0b8457" }]}>Returned On: {returned}</Text>
                )}
          
                {!item.returnDate &&
                  (item.status === "BORROWED" || item.status === "RETURN_REJECTED") && (
                    <TouchableOpacity
                      style={styles.returnBtn}
                      onPress={() => handleReturn(item)}
                    >
                      <Text style={styles.returnText}>
                        {item.status === "RETURN_REJECTED" ? "Retry Return" : "Return"}
                      </Text>
                    </TouchableOpacity>
                  )}
          
                {item.status === "PENDING_RETURN" && (
                  <View style={[styles.returnBtn, { backgroundColor: "#f39c12" }]}>
                    <Text style={styles.returnPendingText}>Return Pending</Text>
                  </View>
                )}
              </View>
            );
          }}
          
          
          
          
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchRecords}
              colors={["#0b7285"]}
            />
          }
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
  book: { fontWeight: "700", fontSize: 17, color: "#094852", marginBottom: 4 },
  meta: { color: "#3a6871", marginTop: 2 },
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
  emptyText: {
    fontSize: 16,
    color: "#7a8a91",
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  pager: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  meta: { color: "#3a6871", marginTop: 4, fontSize: 14 },
  pageBtn: { padding: 10, backgroundColor: "#0b7285", borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: "#9ecad3" },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontWeight: "700", color: "#0e5a64" },
  returnPendingText: { color: "#fff", fontWeight: "700" },
  cardHeaderVertical: {
    flexDirection: "column",
    alignItems: "flex-start", // title aligns left
    marginBottom: 6,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 6, // small spacing below title
    alignSelf: "flex-start", // chip left by default
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  
});
