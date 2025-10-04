import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import BookService from "../api/BookService";
import BorrowService from "../api/BorrowService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PAGE_SIZE = 8;

const BorrowBookScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("title"); 
  const [sortAsc, setSortAsc] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) fetchAvailableBooks();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    setUserId(id);
    fetchAvailableBooks();
  };

 const fetchAvailableBooks = async () => {
  try {
    setLoading(true);
    const allBooks = await BookService.getBooks();

    let available = allBooks.filter((b) => !b.deleted && b.quantity > 0);

    if (userId) {
      const borrowedByUser = await BorrowService.getRecordsByUser(userId);

      const borrowedBookIds = new Set(
        borrowedByUser
          .filter(
            (r) =>
              r.status === "PENDING_BORROW" ||
              r.status === "BORROWED" ||
              r.status === "PENDING_RETURN"
          )
          .map((r) => r.bookId)
      );

      available = available.map((b) => ({
        ...b,
        status: borrowedBookIds.has(b.bookId) ? "ALREADY_BORROWED" : b.status,
      }));
    }

    setBooks(available);

    const uniqueCategories = Array.from(
      new Set(available.map((b) => b.category || "Others"))
    ).filter((cat) => cat !== "ALL");
    setCategories(uniqueCategories);
  } catch (err) {
    console.error("Error fetching books:", err);
    setBooks([]);
  } finally {
    setLoading(false);
  }
};

const handleBorrow = async (bookId) => {
  try {
    if (!userId) {
      console.warn("No userId available. Cannot borrow book.");
      return;
    }

    const book = books.find((b) => b.bookId === bookId);
    if (book?.status === "ALREADY_BORROWED") {
      Alert.alert("Cannot Borrow", "You have already borrowed this book or requested it.");
      return;
    }

    await BorrowService.requestBorrow(userId, bookId);
    Alert.alert("Success", "Borrow request sent to Admin");

    setBooks((prev) =>
      prev.map((b) =>
        b.bookId === bookId ? { ...b, status: "PENDING_BORROW" } : b
      )
    );
  } catch (error) {
    console.error("Error borrowing/requesting book:", error);
    Alert.alert("Error", "Something went wrong");
  }
};


  const filteredBooks = books
    .filter((b) => {
      if (!debouncedSearch) return true;
      const s = debouncedSearch;
      return (
        (b.title || "").toLowerCase().includes(s) ||
        (b.author || "").toLowerCase().includes(s)
      );
    })
    .filter((b) => (filterCategory === "ALL" ? true : b.category === filterCategory))
    .sort((a, b) => {
      if (sortBy === "title") {
        return sortAsc
          ? (a.title || "").localeCompare(b.title || "")
          : (b.title || "").localeCompare(a.title || "");
      } else if (sortBy === "quantity") {
        return sortAsc ? a.quantity - b.quantity : b.quantity - a.quantity;
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginatedBooks = filteredBooks.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  if (loading)
    return <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Available Books</Text>

      <TextInput
        placeholder="Search by title or author"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, filterCategory === "ALL" && styles.activeFilter]}
          onPress={() => setFilterCategory("ALL")}
        >
          <Text style={filterCategory === "ALL" ? styles.activeFilterText : styles.filterText}>
            ALL
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterBtn, filterCategory === cat && styles.activeFilter]}
            onPress={() => setFilterCategory(cat)}
          >
            <Text style={filterCategory === cat ? styles.activeFilterText : styles.filterText}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => {
            if (sortBy === "title") setSortBy("quantity");
            else setSortBy("title");
          }}
        >
          <Text style={styles.sortText}>
            Sort by {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} {sortAsc ? "↑" : "↓"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortAsc((s) => !s)}
        >
          <Text style={styles.sortText}>Sort By ↑ ↓</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={paginatedBooks}
        keyExtractor={(item) => String(item.bookId ?? Math.random())}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookAuthor}>Author: {item.author}</Text>
            <Text style={styles.bookQuantity}>Quantity: {item.quantity}</Text>
            <Text style={styles.bookCategory}>Category: {item.category || "N/A"}</Text>

            {item.status === "PENDING_BORROW" ? (
  <TouchableOpacity style={[styles.borrowBtn, { backgroundColor: "#ffc107" }]} disabled>
    <Text style={styles.borrowText}>Pending Approval</Text>
  </TouchableOpacity>
) : item.status === "ALREADY_BORROWED" ? (
  <TouchableOpacity style={[styles.borrowBtn, { backgroundColor: "#b0bec5" }]} disabled>
    <Text style={styles.borrowText}>Already Borrowed</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity
    style={styles.borrowBtn}
    onPress={() => handleBorrow(item.bookId)}
  >
    <Text style={styles.borrowText}>Borrow</Text>
  </TouchableOpacity>
)}

          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={{ fontSize: 50 }}>📖</Text>
            <Text>No books available to borrow.</Text>
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

export default BorrowBookScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f8fa" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#0e5a64" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d9eef2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#0b7285", backgroundColor: "#fff", marginRight: 6, marginBottom: 6 },
  activeFilter: { backgroundColor: "#0b7285" },
  filterText: { color: "#0b7285", fontWeight: "600" },
  activeFilterText: { color: "#fff", fontWeight: "700" },
  sortContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sortBtn: { padding: 10, borderRadius: 8, backgroundColor: "#e6f7ff", alignItems: "center" },
  sortText: { fontWeight: "600", color: "#0b7285" },
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
  bookTitle: { fontWeight: "700", fontSize: 17, color: "#094852", marginBottom: 4 },
  bookAuthor: { color: "#3a6871", marginBottom: 4 },
  bookQuantity: { color: "#3a6871", marginBottom: 4 },
  bookCategory: { color: "#3a6871", marginBottom: 8 },
  borrowBtn: { backgroundColor: "#0b7285", padding: 10, borderRadius: 10, alignItems: "center" },
  borrowText: { color: "#fff", fontWeight: "700" },
  pager: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  pageBtn: { padding: 10, backgroundColor: "#0b7285", borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: "#9ecad3" },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontWeight: "700", color: "#0e5a64" },
});
