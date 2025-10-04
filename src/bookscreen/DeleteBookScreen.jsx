import React, { useEffect } from "react";
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import BookService from "../api/BookService";

const DeleteBookScreen = ({ navigation, route }) => {
  const { bookId, onDelete } = route.params;

  useEffect(() => {
    if (!bookId) {
      Alert.alert("Error", "No book ID provided.");
      navigation.goBack();
      return;
    }

    const confirmDelete = () => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this book?",
        [
          { 
            text: "Cancel", 
            style: "cancel", 
            onPress: () => navigation.goBack(),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await BookService.deleteBook(bookId);
                if (onDelete) onDelete(bookId);
                Alert.alert("Success", "Book deleted successfully.");
                navigation.goBack();
              } catch (e) {
                console.error("Delete error:", e);
                Alert.alert("Error", "Failed to delete the book.");
                navigation.goBack();
              }
            },
          },
        ]
      );
    };

    confirmDelete();
  }, [bookId]);

  return (
    <LinearGradient
      colors={["#fab1a0", "#e17055"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Deleting book...</Text>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient
            colors={["#dfe6e9", "#b2bec3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cancelGradient}
          >
            <Icon name="close-outline" size={20} color="#2d3436" />
            <Text style={styles.cancelText}>Cancel</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default DeleteBookScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  loadingText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "600", 
    marginTop: 15, 
    textAlign: "center" 
  },
  cancelBtn: { marginTop: 30, borderRadius: 10, overflow: "hidden" },
  cancelGradient: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10 
  },
  cancelText: { 
    color: "#2d3436", 
    fontWeight: "700", 
    fontSize: 16, 
    marginLeft: 8 
  },
});
