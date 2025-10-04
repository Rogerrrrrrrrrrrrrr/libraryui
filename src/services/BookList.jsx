import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import BookService from "../api/BookService";
import BorrowService from "../api/BorrowService";
import BookCard from "../components/BookCard";
import UserSelectedModal from "../components/UserSelectedModal";
import SearchFilterBar from "../components/SearchFilterBar";
import SortOptions from "../components/SortOptions";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

const BookList = ({ navigation, route }) => {
  const { role = "user", userId = null } = route?.params || {};

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await BookService.getBooks();
      const filteredData = Array.isArray(data)
        ? data.filter((b) => !b.deleted)
        : [];
      setBooks(filteredData);
    } catch (e) {
      console.log("Error fetching books:", e);
      Alert.alert("Error", "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  const handleDeleteBook = (bookId) => {
    setBooks((prevBooks) => prevBooks.filter((b) => b.bookId !== bookId));
  };

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [books]);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(search.trim().toLowerCase()),
      300
    );
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    const visibleBooks =
      role === "admin"
        ? books
        : books.filter((b) => (b.quantity ?? 0) > 0);

    const byCategory =
      category === "ALL"
        ? visibleBooks
        : visibleBooks.filter(
            (b) => (b.category || "").toLowerCase() === category.toLowerCase()
          );

    const bySearch = debouncedSearch
      ? byCategory.filter((b) => {
          const t = (b.title || "").toLowerCase();
          const a = (b.author || "").toLowerCase();
          return t.includes(debouncedSearch) || a.includes(debouncedSearch);
        })
      : byCategory;

    const sorted = [...bySearch].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "quantity") {
        const av = Number(a.quantity || 0);
        const bv = Number(b.quantity || 0);
        return av === bv ? 0 : av > bv ? dir : -dir;
      }
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      return av === bv ? 0 : av > bv ? dir : -dir;
    });

    return sorted;
  }, [books, category, debouncedSearch, sortKey, sortDir, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sortKey, sortDir]);

  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  const setSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const borrowBook = async (user, book) => {
    try {
      await BorrowService.borrowBook(user.userId, book.bookId);
      Alert.alert("✅ Success", `${book.title} borrowed by ${user.name}`);
      setModalVisible(false);
      fetchBooks();
    } catch (e) {
      console.log("Borrow error:", e);
      Alert.alert("Error", e.message || "Failed to borrow book");
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>📚 Manage Books</Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate("ScanIsbn")}
      >
        <Text style={styles.scanButtonText}>Scan ISBN</Text>
      </TouchableOpacity>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        categoryValue={category}
        onCategoryChange={setCategory}
        categories={categories}
      />

      <SortOptions
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => {
          setSortKey(key);
          setSortDir(dir);
        }}
      />

      {errorMessage ? (
        <Text style={{ color: "red", marginHorizontal: 16, marginBottom: 8 }}>
          {errorMessage}
        </Text>
      ) : null}

      <FlatList
        data={paginated}
        keyExtractor={(item, index) =>
          item?.bookId ? String(item.bookId) : `fallback-${index}`
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            isAdmin={role === "admin"}
            onBorrow={(book) => {
              setSelectedBook(book);
              setModalVisible(true);
            }}
            onEdit={(book) =>
              navigation.navigate("EditBook", { bookId: book.bookId })
            }
            onDelete={(book) =>
              navigation.navigate("DeleteBook", {
                bookId: book.bookId,
                onDelete: handleDeleteBook,
              })
            }
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No books found</Text>
            </View>
          )
        }
      />

      <Pagination
        currentPage={pageSafe}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddBook")}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {selectedBook && (
        <UserSelectedModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelect={(user) => borrowBook(user, selectedBook)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    color: "#0a4a57",
  },
  scanButton: {
    backgroundColor: "#198754",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#7a8a91",
    fontSize: 16,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0b7285",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#0b7285",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: "#fff", fontSize: 30, lineHeight: 30, marginTop: -2 },
});

export default BookList;
