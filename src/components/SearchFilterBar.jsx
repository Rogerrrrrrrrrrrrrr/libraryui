import React from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";

const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  categoryValue,
  onCategoryChange,
  categories,
}) => {
  return (
    <View style={styles.toolbar}>
      <View style={styles.searchWrap}>
        <TextInput
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder="Search by title or author"
          placeholderTextColor="#999"
          style={styles.search}
          returnKeyType="search"
        />
      </View>

      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={categoryValue}
          onValueChange={onCategoryChange}
          style={styles.picker}
          mode="dropdown" 
        >
          {categories.map((c) => (
            <Picker.Item
              key={c}
              label={c.length > 25 ? c.slice(0, 22) + "..." : c} 
              value={c}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  searchWrap: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d9eef2",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  search: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#333",
  },
 pickerWrap: {
  flex: 1,
  borderRadius: 14,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#d9eef2",
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
  overflow: "visible", 
  justifyContent: "center",
},

picker: {
  width: "100%",
  height: 50, 
  color: "#333",
}

});

export default SearchFilterBar;
