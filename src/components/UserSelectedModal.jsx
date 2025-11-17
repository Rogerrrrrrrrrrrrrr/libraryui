import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import UserService from "../api/UserService";

const UserSelectedModal = ({ visible, onClose, onSelect }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🔄 Modal visibility changed:", visible);
    if (visible) {
      fetchUsers();
    } else {
      // Reset state when modal closes
      setUsers([]);
      setSearch("");
    }
  }, [visible]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching users...");
      
      const data = await UserService.getUsers();
      console.log("✅ Raw users fetched:", data?.length || 0);

      // Filter out admins
      const filtered = Array.isArray(data)
        ? data.filter((u) => u.role?.toLowerCase() !== "admin")
        : [];

      console.log("🧾 Filtered (non-admin) users:", filtered.length);
      console.log("👥 Users:", filtered.map(u => ({
        id: u.userId,
        name: u.name,
        email: u.email,
        role: u.role
      })));

      setUsers(filtered);
    } catch (err) {
      console.error("❌ User fetch error:", err);
      Alert.alert("Error", err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    (`${u.name || ""} ${u.email || ""}`)
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  console.log("🔍 Filtered by search:", filtered.length);

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose} 
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select User</Text>

          <TextInput
            style={styles.search}
            placeholder="Search by name or email"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#0b7285" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) =>
                item.userId?.toString() || Math.random().toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => {
                    console.log("👤 Selected User:", {
                      userId: item.userId,
                      name: item.name,
                      email: item.email,
                      role: item.role
                    });
                    onSelect(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.userText}>{item.name || "Unknown"}</Text>
                  <Text style={styles.userEmail}>{item.email || "No email"}</Text>
                  <Text style={styles.roleBadge}>{item.role || "N/A"}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  {loading ? "Loading..." : "No users found"}
                </Text>
              }
              style={styles.list}
            />
          )}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              console.log("❌ Close button pressed");
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 12, 
    color: "#0e5a64",
    textAlign: "center"
  },
  search: {
    borderWidth: 1,
    borderColor: "#d9eef2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  list: {
    maxHeight: 400,
  },
  userItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f0f8ff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  userText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#094852" 
  },
  userEmail: { 
    fontSize: 14, 
    color: "#3a6871", 
    marginTop: 2 
  },
  roleBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#e0fbff",
    color: "#076178",
    borderRadius: 50,
    fontSize: 12,
    fontWeight: "700",
  },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0b7285",
    alignItems: "center",
  },
  closeText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
  empty: { 
    textAlign: "center", 
    marginTop: 20, 
    color: "#666", 
    fontSize: 16 
  },
});

export default UserSelectedModal;