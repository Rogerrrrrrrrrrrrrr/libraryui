import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={currentPage <= 1 ? ["#ccc", "#ccc"] : ["#0b7285", "#0f4c75"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.pageBtnText}>Prev</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.pageInfo}>
        Page <Text style={styles.currentPage}>{currentPage}</Text> / {totalPages}
      </Text>

      <TouchableOpacity
        style={[
          styles.pageBtn,
          currentPage >= totalPages && styles.pageBtnDisabled,
        ]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={currentPage >= totalPages ? ["#ccc", "#ccc"] : ["#0b7285", "#0f4c75"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.pageBtnText}>Next</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  pageBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  gradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  pageBtnDisabled: {
    opacity: 0.6,
  },
  pageBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  pageInfo: {
    color: "#0e5a64",
    fontWeight: "700",
  },
  currentPage: {
    color: "#0b7285",
  },
});

export default Pagination;
