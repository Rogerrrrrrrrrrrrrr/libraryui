import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import BookService from "../api/BookService";

const EditBook = ({ route, navigation }) => {
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) {
      Alert.alert("Error", "Book ID is missing");
      navigation.goBack();
      return;
    }

    const loadBook = async () => {
      try {
        const bookData = await BookService.getBookById(bookId);
        setBook(bookData);
      } catch (e) {
        console.log("Fetch error:", e);
        Alert.alert("Error", e.message || "Failed to load book details");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  const handleUpdate = async () => {
    if (!book.title || !book.author) {
      Alert.alert("Validation", "Title and Author are required");
      return;
    }

    try {
      const updatedBook = {
        ...book,
        quantity: Number(book.quantity) || 0,
      };

      await BookService.updateBook(bookId, updatedBook);

      Alert.alert("Success", "Book updated successfully");
      navigation.goBack();
    } catch (e) {
      console.log("Update error:", e);
      Alert.alert("Error", "Failed to update book");
    }
  };

  if (loading || !book) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0b7285" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Book</Text>

      <TextInput
        placeholder="Title"
        value={book.title}
        onChangeText={(t) => setBook({ ...book, title: t })}
        style={styles.input}
      />

      <TextInput
        placeholder="Author"
        value={book.author}
        onChangeText={(a) => setBook({ ...book, author: a })}
        style={styles.input}
      />

      <TextInput
        placeholder="ISBN"
        value={book.isbn}
        onChangeText={(i) => setBook({ ...book, isbn: i })}
        style={styles.input}
      />

      <TextInput
        placeholder="Category"
        value={book.category}
        onChangeText={(c) => setBook({ ...book, category: c })}
        style={styles.input}
      />

      <TextInput
        placeholder="Quantity"
        value={String(book.quantity ?? "")}
        onChangeText={(q) =>
          setBook({ ...book, quantity: q.replace(/[^0-9]/g, "") })
        }
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity onPress={handleUpdate} style={styles.btn}>
        <LinearGradient
          colors={["#0b7285", "#0f4c75"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnGradient}
        >
          <Text style={styles.btnText}>Update</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f6fa",
    alignItems: "stretch",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#0b7285",
    fontWeight: "600",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#0b7285",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  btn: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  btnGradient: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default EditBook;
