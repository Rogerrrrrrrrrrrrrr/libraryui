import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import BorrowService from "../api/BorrowService";

const PAGE_SIZE = 8;

const BorrowHistoryScreen = ({ route }) => {
  const { role: routeRole, userId: routeUserId } = route.params || {};

  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState(null);
  const [items, setItems] = useState([
    { label: "All", value: "ALL" },
    { label: "Borrowed", value: "BORROWED" },
    { label: "Returned", value: "RETURNED" },
    { label: "Pending Borrow", value: "PENDING_BORROW" },
    { label: "Pending Return", value: "PENDING_RETURN" },
    { label: "Borrow Rejected", value: "BORROW_REJECTED" },
    { label: "Return Rejected", value: "RETURN_REJECTED" },
  ]);
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
      let allRecords = [];

      if (routeRole === "admin") {
        const records = await BorrowService.getAllBorrowed();
        allRecords = Array.isArray(records) ? records : [];
      } else if (routeRole === "student" && routeUserId) {
        const userRecords = await BorrowService.getRecordsByUser(routeUserId);
        allRecords = Array.isArray(userRecords) ? userRecords : [];
      }

      setBorrowRecords(allRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = borrowRecords
    .filter(r => !filter || filter === "ALL" ? true : r.status === filter)
    .filter(r => {
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
    return <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 50 }} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ zIndex: 1000, marginBottom: 12 }}>
  <TextInput
    placeholder="Search by book or user"
    style={styles.search}
    value={search}
    onChangeText={setSearch}
  />

<View style={{ zIndex: 999, marginTop: 8 }}>
    <DropDownPicker
      open={filterOpen}
      value={filter}
      items={items}
      setOpen={setFilterOpen}
      setValue={setFilter}
      setItems={setItems}
      placeholder="Filter by status"
    />
  </View>
</View>

        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortAsc(s => !s)}
        >
          <Text style={styles.sortText}>Sort by Issued Date {sortAsc ? "↑" : "↓"}</Text>
        </TouchableOpacity>

        <FlatList
  data={paginated}
  keyExtractor={item => String(item.recordId ?? Math.random())}
  renderItem={({ item }) => (
    <View style={styles.card}>
      <Text style={styles.book}>{item.bookTitle}</Text>

      {routeRole === "admin" && (
        <Text style={styles.meta}>User: {item.userName}</Text>
      )}

      <Text style={styles.meta}>Email: {item.userEmail}</Text>
      <Text style={styles.meta}>Status: {item.status}</Text>

      <Text style={styles.meta}>
        Issued: {item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "-"}
      </Text>

      {item.returnDate && (
        <Text style={styles.meta}>
          Returned: {new Date(item.returnDate).toLocaleDateString()}
        </Text>
      )}

      {item.borrowRequestDate && (
        <Text style={styles.meta}>
          Borrow Requested: {new Date(item.borrowRequestDate).toLocaleDateString()}
        </Text>
      )}

      {item.returnRequestDate && (
        <Text style={styles.meta}>
          Return Requested: {new Date(item.returnRequestDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  )}
  contentContainerStyle={{ paddingBottom: 20 }}
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📖</Text>
      <Text style={styles.emptyText}>No borrow records found.</Text>
    </View>
  }
/>



        {filtered.length > 0 && (
          <View style={styles.pager}>
            <TouchableOpacity
              disabled={pageSafe <= 1}
              onPress={() => setPage(pageSafe - 1)}
              style={[styles.pageBtn, pageSafe <= 1 && styles.pageBtnDisabled]}
            >
              <Text style={styles.pageBtnText}>Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>Page {pageSafe} / {totalPages}</Text>
            <TouchableOpacity
              disabled={pageSafe >= totalPages}
              onPress={() => setPage(pageSafe + 1)}
              style={[styles.pageBtn, pageSafe >= totalPages && styles.pageBtnDisabled]}
            >
              <Text style={styles.pageBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa" },
  search: { borderWidth: 1, borderColor: "#d9eef2", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  sortBtn: { marginBottom: 14, padding: 10, borderRadius: 8, backgroundColor: "#e6f7ff", alignItems: "center" },
  sortText: { fontWeight: "600", color: "#0b7285" },
  card: { padding: 16, borderRadius: 16, backgroundColor: "#fff", marginBottom: 12, elevation: 4 },
  book: { fontWeight: "700", fontSize: 17, color: "#094852", marginBottom: 4 },
  meta: { color: "#3a6871", marginTop: 2 },
  pager: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  pageBtn: { padding: 10, backgroundColor: "#0b7285", borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: "#9ecad3" },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontWeight: "700", color: "#0e5a64" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa", position: 'relative' },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#7a8a91", fontStyle: "italic", textAlign: "center", paddingHorizontal: 20 },
});

export default BorrowHistoryScreen;
