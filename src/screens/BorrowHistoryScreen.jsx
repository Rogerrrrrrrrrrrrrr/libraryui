import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import BorrowService from "../api/BorrowService";

const PAGE_SIZE = 8;

const BorrowHistoryScreen = ({ route }) => {
  const { role: routeRole, userId: routeUserId } = route.params || {};
  console.log("📌 [BorrowHistoryScreen] received route params:", route.params);

  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(false);
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
      console.log("⏳ [BorrowHistoryScreen] fetching borrow records...");

      let allRecords = [];

      if (routeRole === "admin") {
        console.log("📌 [BorrowHistoryScreen] fetching all records (admin)...");
        const records = await BorrowService.getAllBorrowed();
        allRecords = Array.isArray(records) ? records : [];
      } else if (routeRole === "student" && routeUserId) {
        console.log(`📌 [BorrowHistoryScreen] fetching records for userId=${routeUserId}`);
        const userRecords = await BorrowService.getRecordsByUser(routeUserId);
        console.log("📋 [BorrowHistoryScreen] received user records:", userRecords);
        allRecords = Array.isArray(userRecords) ? userRecords : [];
      } else {
        console.warn("⚠️ [BorrowHistoryScreen] No valid userId provided for non-admin user");
      }

      setBorrowRecords(allRecords);
      console.log("✅ [BorrowHistoryScreen] set borrowRecords state with", allRecords.length, "records");
    } catch (error) {
      console.error("❌ [BorrowHistoryScreen] Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = borrowRecords
    .filter((r) => (filter === "ALL" ? true : r.status === filter))
    .filter((r) => {
      if (!debouncedSearch) return true;
      const s = debouncedSearch;
      return (r.bookTitle || "").toLowerCase().includes(s) || (r.userName || "").toLowerCase().includes(s);
    })
    .sort((a, b) => {
      const da = new Date(a.issuedDate || 0);
      const db = new Date(b.issuedDate || 0);
      return sortAsc ? da - db : db - da;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  if (loading)
    return (
      <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 50 }} />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Borrow History</Text>

      <TextInput
        placeholder="Search by user or book"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        {["ALL", "BORROWED", "RETURNED"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f)}
          >
            <Text style={filter === f ? styles.activeFilterText : styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={paginated}
        keyExtractor={(item) => String(item.recordId ?? Math.random())}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.book}>{item.bookTitle}</Text>
            {routeRole === "admin" && (
              <Text style={styles.meta}>User: <Text style={styles.user}>{item.userName}</Text></Text>
            )}
            <Text style={styles.meta}>Status: {item.status}</Text>
            <Text style={styles.meta}>
              Issued: {item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "-"}
            </Text>
            {item.returnDate && (
              <Text style={styles.meta}>
                Returned: {new Date(item.returnDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>No borrow  found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#0e5a64" },
  search: { borderWidth: 1, borderColor: "#d9eef2", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  filters: { flexDirection: "row", gap: 10, marginBottom: 12 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderRadius: 8, borderColor: "#0b7285", backgroundColor: "#fff" },
  activeFilter: { backgroundColor: "#0b7285" },
  filterText: { color: "#0b7285", fontWeight: "600" },
  activeFilterText: { color: "#fff", fontWeight: "700" },
  card: { padding: 16, borderRadius: 16, backgroundColor: "#fff", marginBottom: 12, elevation: 4 },
  book: { fontWeight: "700", fontSize: 17, color: "#094852", marginBottom: 4 },
  meta: { color: "#3a6871", marginTop: 2 },
  user: { fontWeight: "600", color: "#0b7285" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#7a8a91", fontStyle: "italic", textAlign: "center", paddingHorizontal: 20 },
});

export default BorrowHistoryScreen;
