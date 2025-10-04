import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const BookCard = ({ book, onBorrow, onEdit, onDelete }) => {
  const isAvailable = book.status === "AVAILABLE" && book.quantity > 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.badge}>{book.category || "General"}</Text>
      </View>

      <Text style={styles.meta}>
        Author: <Text style={styles.metaBold}>{book.author}</Text>
      </Text>
      <Text style={styles.meta}>
        ISBN: <Text style={styles.metaBold}>{book.isbn || "-"}</Text>
      </Text>
      <Text style={styles.meta}>
        Quantity: <Text style={styles.metaBold}>{book.quantity ?? 0}</Text>
      </Text>
      <Text style={styles.meta}>
        Status:{" "}
        <Text style={styles.metaBold}>
          {book.status || (book.quantity > 0 ? "AVAILABLE" : "OUT_OF_STOCK")}
        </Text>
      </Text>

      <View style={styles.actionsRow}>
        {isAvailable ? (
          <TouchableOpacity style={styles.borrowBtn} onPress={() => onBorrow(book)}>
            <LinearGradient
              colors={["#0b7285", "#0f4c75"]}
              style={styles.gradientBtn}
            >
              <Text style={styles.actionText}>Borrow</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[styles.borrowBtn, styles.disabledBtn]}>
            <Text style={[styles.actionText, { color: "#999" }]}>
              {book.status === "ISSUED" ? "Already Borrowed" : "Not Available"}
            </Text>
          </View>
        )}

        <TouchableOpacity style={[styles.editBtn]} onPress={() => onEdit(book)}>
          <LinearGradient
            colors={["#74c0fc", "#339af0"]}
            style={styles.gradientBtn}
          >
            <Text style={styles.actionText}>Edit</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.deleteBtn]} onPress={() => onDelete(book)}>
          <LinearGradient
            colors={["#ffa8a8", "#ff6b6b"]}
            style={styles.gradientBtn}
          >
            <Text style={styles.actionText}>Delete</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8f3f6",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#094852",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#e0fbff",
    color: "#076178",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    overflow: "hidden",
    alignSelf: "center",
    fontWeight: "700",
    fontSize: 12,
  },
  meta: { color: "#3a6871", marginTop: 2 },
  metaBold: { fontWeight: "700", color: "#0e5a64" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  gradientBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionText: { fontWeight: "700", color: "#fff", fontSize: 14 },
  borrowBtn: { borderRadius: 12, overflow: "hidden" },
  disabledBtn: { backgroundColor: "#ddd", opacity: 0.6 },
  editBtn: { borderRadius: 12, overflow: "hidden" },
  deleteBtn: { borderRadius: 12, overflow: "hidden" },
});

export default BookCard;
