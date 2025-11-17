import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import BorrowService from "../api/BorrowService";
import Toast from "react-native-toast-message";

const PAGE_SIZE = 8;
const STATUS_OPTIONS = ["ALL", "PENDING_BORROW", "PENDING_RETURN", "BORROWED", "RETURNED"];

const PendingRequestsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [items, setItems] = useState(
    STATUS_OPTIONS.map((status) => ({ label: status, value: status }))
  );

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

      const combined = [
        ...((Array.isArray(borrows) ? borrows : []).map((r) => ({ ...r, type: "borrow" }))),
        ...((Array.isArray(returns) ? returns : []).map((r) => ({ ...r, type: "return" }))),
      ];
      setRequests(combined);
    } catch (err) {
      console.error("Pending requests fetch error:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests
    .filter((r) => (filter === "ALL" ? true : r.status === filter))
    .filter((r) => {
      if (!debouncedSearch) return true;
      const s = debouncedSearch;
      return (
        (r.bookTitle || "").toLowerCase().includes(s) ||
        (r.userName || "").toLowerCase().includes(s) ||
        (r.userEmail || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const da = new Date(a.borrowRequestDate || a.returnRequestDate || 0);
      const db = new Date(b.borrowRequestDate || b.returnRequestDate || 0);
      return sortAsc ? da - db : db - da;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleApprove = async (request) => {
    try {
      if (request.type === "borrow") {
        await BorrowService.approveBorrow(request.recordId);
      } else {
        await BorrowService.approveReturn(request.recordId);
      }
      fetchRequests();
      Toast.show({
        type: "success",
        text1: "Request Approved",
        text2: `Request approved for ${request.userName}`,
        position: "bottom",
        visibilityTime: 3000,
      });
    } catch (err) {
      console.error("Approve error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to approve request",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  const handleReject = (request) => {
    navigation.navigate("RejectReasonScreen", { record: request });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  if (loading) return <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 50 }} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <TextInput
          placeholder="Search by book, user, or email"
          style={[styles.search, { zIndex: 1000 }]}
          value={search}
          onChangeText={setSearch}
        />

        <View style={{ marginBottom: 12, zIndex: 999 }}>
          <DropDownPicker
            open={filterOpen}
            value={filter}
            items={items}
            setOpen={setFilterOpen}
            setValue={setFilter}
            setItems={setItems}
            placeholder="Filter by status"
            zIndex={999}
          />
        </View>

        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortAsc((s) => !s)}>
          <Text style={styles.sortText}>Sort by Request Date {sortAsc ? "↑" : "↓"}</Text>
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
              <Text style={styles.meta}>Email: {item.userEmail}</Text>
              <Text style={styles.meta}>
                Type: <Text style={item.type === "borrow" ? styles.borrowType : styles.returnType}>
                  {item.type === "borrow" ? "Borrow" : "Return"}
                </Text>
              </Text>
              <Text style={styles.meta}>
                Request Date:{" "}
                {item.borrowRequestDate
                  ? new Date(item.borrowRequestDate).toLocaleDateString()
                  : item.returnRequestDate
                  ? new Date(item.returnRequestDate).toLocaleDateString()
                  : "-"}
              </Text>

              <TouchableOpacity
                style={[styles.actionBtn, item.type === "return" ? styles.approveReturnBtn : styles.approveBorrowBtn]}
                onPress={() => handleApprove(item)}
              >
                <Text style={styles.actionText}>{item.type === "borrow" ? "Approve Borrow" : "Approve Return"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleReject(item)}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Pagination */}
        <View style={styles.pager}>
          <TouchableOpacity
            style={[styles.pageBtn, pageSafe === 1 && styles.pageBtnDisabled]}
            onPress={() => handlePageChange(pageSafe - 1)}
          >
            <Text style={styles.pageBtnText}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            Page {pageSafe} of {totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.pageBtn, pageSafe === totalPages && styles.pageBtnDisabled]}
            onPress={() => handlePageChange(pageSafe + 1)}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa" },
  search: { borderWidth: 1, borderColor: "#d9eef2", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  sortBtn: { marginBottom: 14, padding: 10, borderRadius: 8, backgroundColor: "#e6f7ff", alignItems: "center" },
  sortText: { fontWeight: "600", color: "#0b7285" },
  card: { padding: 16, borderRadius: 16, backgroundColor: "#fff", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  book: { fontWeight: "700", fontSize: 17, color: "#094852", marginBottom: 4 },
  meta: { color: "#3a6871", marginTop: 2 },
  actionBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 12, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "700" },
  approveBorrowBtn: { backgroundColor: "#0b7285" },
  approveReturnBtn: { backgroundColor: "#f39c12" },
  rejectBtn: { backgroundColor: "#e74c3c" },
  pager: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  pageBtn: { padding: 10, backgroundColor: "#0b7285", borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: "#9ecad3" },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontWeight: "700", color: "#0e5a64" },
  borrowCard: { borderLeftWidth: 6, borderLeftColor: "#0b7285" },
  returnCard: { borderLeftWidth: 6, borderLeftColor: "#f39c12" },
  borrowType: { color: "#0b7285", fontWeight: "700" },
  returnType: { color: "#f39c12", fontWeight: "700" },
});

export default PendingRequestsScreen;
