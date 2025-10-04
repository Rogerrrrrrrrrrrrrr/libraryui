import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import UserService from "../api/UserService";

const EditUserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [originalRole, setOriginalRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await UserService.getUserById(userId);
        setUser(data);
        setOriginalRole(data.role);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load user");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

 const handleSave = async () => {
  if (!user.name || !user.email) {
    Alert.alert("Validation Error", "Name and Email are required!");
    return;
  }

  try {
    const payload = {
      name: user.name,
      email: user.email,
      password: user.password || undefined,
      role: originalRole, 
    };

    await UserService.updateUser(userId, payload);

    Alert.alert("Success", "User updated successfully", [
      {
        text: "OK",
        onPress: () => navigation.replace("Users", { refresh: true }), 
      },
    ]);
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Failed to update user");
  }
};


  if (loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#81ecec", "#74b9ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Edit User</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={user.name}
            onChangeText={(text) => setUser({ ...user, name: text })}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#636e72"
            secureTextEntry
            value={user.password || ""}
            onChangeText={(text) => setUser({ ...user, password: text })}
          />

          <Text style={styles.label}>Role</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#dfe6e9" }]}
            value={originalRole || "N/A"}
            editable={false}
          />

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <LinearGradient
              colors={["#00cec9", "#00b894"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Icon name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Save Changes</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    padding: 20,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    alignSelf: "flex-start",
    color: "#2d3436",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  saveBtn: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 10,
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 30,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
};

export default EditUserScreen;
