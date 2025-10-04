import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Animated,
  RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import UserService from "../api/UserService";

const getId = (u) => u?.id ?? u?.userId ?? u?.user_id ?? null;

const Users = ({ navigation, route }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const animationValues = useRef([]).current;

  const fetchCurrentUser = async () => {
    try {
      const role = route.params?.role || (await AsyncStorage.getItem("role"));
      const userId =
        route.params?.userId || (await AsyncStorage.getItem("userId"));
      setCurrentUserRole(role);
      setCurrentUserId(userId);
      fetchUsers(role, userId);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchUsers = async (role, userId) => {
    setLoading(true);
    try {
      let data = await UserService.getUsers();

      if (role?.toLowerCase() === "admin") {
        data = data.filter(
          (u) =>
            (u.role?.toLowerCase() === "student") ||
            getId(u) === Number(userId)
        );
      } else {
        data = data.filter((u) => getId(u) === Number(userId));
      }

      data.forEach((_, i) => {
        animationValues[i] = new Animated.Value(0);
      });

      setUsers(data);

      Animated.stagger(
        100,
        data.map((_, i) =>
          Animated.spring(animationValues[i], {
            toValue: 1,
            useNativeDriver: true,
          })
        )
      ).start();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [route.params]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(currentUserRole, currentUserId);
  };

  useEffect(() => {
    if (route.params?.refresh) {
      fetchUsers(currentUserRole, currentUserId);
      navigation.setParams({ refresh: false });
    }
  }, [route.params]);

  const filteredUsers = users.filter((u) => {
    if (!searchText.trim()) return true;
    const s = searchText.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s))
    );
  });

  return (
    <LinearGradient
      colors={["#74b9ff", "#81ecec"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {currentUserRole?.toLowerCase() === "admin" && (
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
          onPress={() => navigation.replace("AddUser")}
        >
          <Icon name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Student</Text>
        </Pressable>
      )}

      <TextInput
        style={styles.input}
        placeholder="Search by name or email"
        placeholderTextColor="#636e72"
        value={searchText}
        onChangeText={setSearchText}
      />

      {users.length === 0 && !loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <Text style={{ fontSize: 16, color: "#2d3436" }}>No users found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item, index) =>
            getId(item)?.toString() ?? `idx-${index}`
          }
          contentContainerStyle={{ paddingBottom: 50 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item, index }) => {
            const id = getId(item);
            const scale = new Animated.Value(1);

            const onPressIn = () => {
              Animated.spring(scale, {
                toValue: 0.97,
                useNativeDriver: true,
              }).start();
            };
            const onPressOut = () => {
              Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
            };

            const slideAnim = animationValues[index] || new Animated.Value(0);

            const translateY = slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            });

            const opacity = slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <Animated.View
                style={[styles.userCard, { transform: [{ translateY }], opacity }]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <Text style={styles.userText}>{item.name || "No Name"}</Text>
                    <Text style={styles.emailText}>{item.email || "No Email"}</Text>
                    {currentUserRole?.toLowerCase() === "admin" && (
                      <Text style={styles.roleText}>Role: {item.role || "N/A"}</Text>
                    )}
                  </View>
                  <View style={styles.iconRow}>
                    <Pressable
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                      onPress={() =>
                        navigation.replace("EditUser", {
                          userId: id,
                          isSelf: currentUserRole?.toLowerCase() !== "admin",
                        })
                      }
                    >
                      <Icon name="create-outline" size={22} color="#0984e3" />
                      <Text style={styles.iconLabel}>Edit</Text>
                    </Pressable>

                    {currentUserRole?.toLowerCase() === "admin" && (
                      <Pressable
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                        onPress={() =>
                          navigation.replace("DeleteUser", { userId: id })
                        }
                      >
                        <Icon name="trash-outline" size={22} color="#d63031" />
                        <Text style={styles.iconLabel}>Delete</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Animated.View>
            );
          }}
        />
      )}
    </LinearGradient>
  );
};

const styles = {
  container: { flex: 1, padding: 15 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00b894",
    padding: 14,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#0984e3",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  userText: { fontSize: 17, fontWeight: "bold", color: "#2d3436" },
  emailText: { color: "#636e72", fontSize: 14, marginBottom: 4 },
  roleText: { color: "#636e72", fontSize: 13 },
  iconRow: { flexDirection: "row", gap: 12 },
  iconBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  iconLabel: { fontSize: 10, color: "#2d3436", marginTop: 2 },
};

export default Users;
