import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from "react-native";

const BooksScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      let response = await fetch("http://10.0.2.2:8080/api/books");
      let data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const deleteBook = async (id) => {
    try {
      await fetch(`http://10.0.2.2:8080/api/books/${id}`, { method: "DELETE" });
      Alert.alert("Success", "Book deleted");
      fetchBooks(); 
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

useEffect(() => {
  const unsubscribe = navigation.addListener("focus", fetchBooks);
  return unsubscribe;
}, [navigation]);


  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Add Book" onPress={() => navigation.navigate("AddBook")} />

      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              marginVertical: 5,
              borderWidth: 1,
              borderRadius: 5,
            }}
          >

            <Text style={{ fontSize: 18 }}>{item.title}</Text>
            <Text>Author: {item.author}</Text>
            <Text>ISBN: {item.isbn}</Text>

            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <Button
                title="Edit"
                onPress={() => navigation.navigate("EditBook", { book: item })}
              />
              <View style={{ width: 10 }} />
              
              <Button
                title="Delete"
                color="red"
                onPress={() =>
                  Alert.alert("Confirm", "Delete this book?", [
                    { text: "Cancel" },
                    { text: "Yes", onPress: () => deleteBook(item.id) },
                  ])
                }
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default BooksScreen;
