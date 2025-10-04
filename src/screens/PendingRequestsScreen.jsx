import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import BorrowService from "../api/BorrowService";
import { Alert } from "react-native";

const PAGE_SIZE = 8;

const PendingRequestsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const borrows = await BorrowService.getPendingBorrows();
      const returns = await BorrowService.getPendingReturns();
      setBorrowRequests(Array.isArray(borrows) ? borrows : []);
      setReturnRequests(Array.isArray(returns) ? returns : []);
    } catch (err) {
      console.error("Pending requests fetch error:", err);
      setBorrowRequests([]);
      setReturnRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item) => {
  try {
    if (item.type === "borrow") {
      await BorrowService.approveBorrow(item.recordId);
      Alert.alert(
        "✅ Approved",
        `Book "${item.bookTitle}" has been assigned to ${item.userName}`
      );
    } else if (item.type === "return") {
      await BorrowService.approveReturn(item.recordId);
      Alert.alert(
        "✅ Approved",
        `Book "${item.bookTitle}" has been returned by ${item.userName}`
      );
    }
    fetchRequests(); // refresh after approval
  } catch (err) {
    console.error("Approve error:", err);
    Alert.alert("❌ Error", "Something went wrong while approving request.");
  }
};


  const combined = [
    ...borrowRequests.map((r) => ({ ...r, type: "borrow" })),
    ...returnRequests.map((r) => ({ ...r, type: "return" })),
  ]
    .filter((r) => {
      if (!debouncedSearch) return true;
      const s = debouncedSearch;
      return (
        (r.bookTitle || "").toLowerCase().includes(s) ||
        (r.userName || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const da = new Date(a.issuedDate || 0);
      const db = new Date(b.issuedDate || 0);
      return sortAsc ? da - db : db - da;
    });

  const totalPages = Math.max(1, Math.ceil(combined.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = combined.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  if (loading)
    return <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📬 Pending Requests</Text>

      <TextInput
        placeholder="Search by user or book"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity style={styles.sortBtn} onPress={() => setSortAsc((s) => !s)}>
        <Text style={styles.sortText}>Sort by Date {sortAsc ? "↑" : "↓"}</Text>
      </TouchableOpacity>

      <FlatList
        data={paginated}
        keyExtractor={(item) => String(item.recordId ?? Math.random())}
        renderItem={({ item }) => (
  <View
    style={[
      styles.card,
      item.type === "return" ? styles.returnCard : styles.borrowCard,
    ]}
  >
    <Text style={styles.book}>{item.bookTitle}</Text>
    <Text style={styles.meta}>User: {item.userName}</Text>
    <Text style={styles.meta}>
      Type:{" "}
      <Text style={item.type === "return" ? styles.returnType : styles.borrowType}>
        {item.type === "borrow" ? "Borrow" : "Return"}
      </Text>
    </Text>
    <Text style={styles.meta}>
      Issued: {item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "-"}
    </Text>

    <TouchableOpacity
      style={[
        styles.approveBtn,
        item.type === "return" ? styles.approveReturnBtn : styles.approveBorrowBtn,
      ]}
      onPress={() => handleApprove(item)}
    >
      <Text style={styles.approveText}>
        {item.type === "borrow" ? "Approve Borrow" : "Approve Return"}
      </Text>
    </TouchableOpacity>
  </View>
)}

        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No pending requests found.</Text>
          </View>
        }
      />

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
    </View>
  );
};

export default PendingRequestsScreen;

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
  sortBtn: { marginBottom: 14, padding: 10, borderRadius: 8, backgroundColor: "#e6f7ff", alignItems: "center" },
  sortText: { fontWeight: "600", color: "#0b7285" },
  card: { padding: 16, borderRadius: 16, backgroundColor: "#fff", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  book: { fontWeight: "700", fontSize: 17, color: "#094852", marginBottom: 4 },
  meta: { color: "#3a6871", marginTop: 2 },
  approveBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: "#0b7285", alignItems: "center" },
  approveText: { color: "#fff", fontWeight: "700" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#7a8a91", fontStyle: "italic", textAlign: "center", paddingHorizontal: 20 },
  pager: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  pageBtn: { padding: 10, backgroundColor: "#0b7285", borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: "#9ecad3" },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontWeight: "700", color: "#0e5a64" },
  borrowCard: { borderLeftWidth: 6, borderLeftColor: "#0b7285" }, 
  returnCard: { borderLeftWidth: 6, borderLeftColor: "#f39c12" },

  borrowType: { color: "#0b7285", fontWeight: "700" },
  returnType: { color: "#f39c12", fontWeight: "700" },

  approveBorrowBtn: { backgroundColor: "#0b7285" },
  approveReturnBtn: { backgroundColor: "#f39c12" },
});
