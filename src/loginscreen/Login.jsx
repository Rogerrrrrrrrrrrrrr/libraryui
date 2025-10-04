import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors, Typography, ButtonStyles } from "../styles/theme";
import { inputStyles } from "../styles/inputStyles";
import { cardStyles } from "../styles/cardStyles";
import LoginStyles from "../styles/LoginStyles";  


import { loginUser } from "../api/loginapi";
import { storeToken, getUserData, removeToken } from "../utils/storage";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleLogin = async () => {
    let valid = true;
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      valid = false;
    } else setEmailError(false);

    if (!password) {
      setPasswordError(true);
      valid = false;
    } else setPasswordError(false);

    if (!valid) return;

    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      if (data?.role) {
        await AsyncStorage.setItem("role", data.role);
        await AsyncStorage.setItem("userId", String(data.userId));
        await storeToken(JSON.stringify(data));

        if (data.role === "ADMIN") navigation.replace("AdminDashboard");
else navigation.replace("UserDashboard");

      } else alert(data?.message || "Invalid credentials");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={[Colors.secondary, Colors.secondaryDark]} style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <View style={cardStyles.card}>
        <Text style={cardStyles.title}>Welcome Back 👋</Text>
        <Text style={cardStyles.subtitle}>Login to continue</Text>

        {/* Email */}
        <View style={inputStyles.container}>
          <Icon name="mail-outline" size={20} color={Colors.primary} style={inputStyles.icon} />
          <TextInput
            placeholder="Enter Email"
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={(text) => { setEmail(text); if (emailError) setEmailError(false); }}
            style={inputStyles.input}
            keyboardType="email-address"
          />
        </View>
        {emailError && <Text style={inputStyles.errorText}>Enter valid email</Text>}

        <View style={inputStyles.container}>
          <Icon name="lock-closed-outline" size={20} color={Colors.primary} style={inputStyles.icon} />
          <TextInput
            placeholder="Enter Password"
            placeholderTextColor={Colors.textLight}
            value={password}
            onChangeText={(text) => { setPassword(text); if (passwordError) setPasswordError(false); }}
            secureTextEntry={!showPassword}
            style={inputStyles.input}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={Colors.primary} style={inputStyles.eyeIcon} />
          </Pressable>
        </View>
        {passwordError && <Text style={inputStyles.errorText}>Enter valid password</Text>}

        <TouchableOpacity>
          <Text style={{ color: Colors.primary, textAlign: "right", marginBottom: 20, textDecorationLine: "underline", fontSize: Typography.caption.fontSize }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={handleLogin}>
          <LinearGradient colors={ButtonStyles.primary.background} style={{
            paddingVertical: ButtonStyles.primary.paddingVertical,
            borderRadius: ButtonStyles.primary.borderRadius,
            alignItems: "center",
            marginBottom: 10,
            shadowColor: ButtonStyles.primary.shadow.color,
            shadowOpacity: ButtonStyles.primary.shadow.opacity,
            shadowRadius: ButtonStyles.primary.shadow.radius,
            shadowOffset: ButtonStyles.primary.shadow.offset,
          }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: ButtonStyles.primary.textColor, fontWeight: "bold", fontSize: Typography.body.fontSize }}>Login</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Login;
