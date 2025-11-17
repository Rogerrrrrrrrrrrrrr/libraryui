import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

import BookService from "../api/BookService";
//const API = "http://10.0.2.2:8080/api/books";

const AddBook = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSave = async () => {
    if (!title || !author) {
      Alert.alert("Validation", "Title and Author are required");
      return;
    }
    try {
      // const res = await fetch(API, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ title, author, isbn, category, quantity }),
      // });
      const newBook = { title, author, isbn, category, quantity: Number(quantity) };

      await BookService.addBook(newBook);
      Alert.alert("Success", "Book added successfully");
      navigation.goBack();
    } catch (e) {
      console.log("Add error:", e);
      Alert.alert("Error", "Failed to add book");
    }
  };

  return (
    <LinearGradient
      colors={["#81ecec", "#74b9ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.header}>Add Book</Text>

          <TextInput
            placeholder="Title"
            value={title}
            placeholderTextColor="#636e72"
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Author"
            value={author}
            placeholderTextColor="#636e72"
            onChangeText={setAuthor}
            style={styles.input}
          />
          <TextInput
            placeholder="ISBN"
            value={isbn}
            placeholderTextColor="#636e72"
            onChangeText={setIsbn}
            style={styles.input}
          />
          <TextInput
            placeholder="Category"
            value={category}
            placeholderTextColor="#636e72"
            onChangeText={setCategory}
            style={styles.input}
          />
          <TextInput
            placeholder="Quantity"
            value={quantity}
            placeholderTextColor="#636e72"
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <LinearGradient
              colors={["#00b894", "#00cec9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Icon name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Save Book</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#2d3436", textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f1f2f6",
    color: "#000",
  },
  btn: { marginTop: 10, borderRadius: 10, overflow: "hidden" },
  btnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default AddBook;
