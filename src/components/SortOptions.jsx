import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const SortOptions = ({ sortKey, sortDir, onSortChange }) => {
  const options = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "quantity", label: "Qty" },
  ];

  const handlePress = (key) => {
    if (key === sortKey) {
      onSortChange(key, sortDir === "asc" ? "desc" : "asc");
    } else {
      onSortChange(key, "asc");
    }
  };

  return (
    <View style={styles.sortRow}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      {options.map(({ key, label }) => {
        const isActive = sortKey === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => handlePress(key)}
            style={[
              styles.sortBtn,
              isActive && styles.sortActiveBtn,
            ]}
          >
            <Text style={[styles.sortBtnText, isActive && styles.sortActiveText]}>
              {label} {isActive ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sortLabel: { color: "#0e5a64", fontWeight: "600", marginRight: 8 },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#e7f5ff",
  },
  sortActiveBtn: { backgroundColor: "#0b7285" },
  sortBtnText: { color: "#0b7285", fontWeight: "600" },
  sortActiveText: { color: "#fff", fontWeight: "700" },
});

export default SortOptions;
