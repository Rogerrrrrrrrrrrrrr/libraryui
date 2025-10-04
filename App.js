import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./src/loginscreen/Login";
import AdminDashboard from "./src/components/AdminDashboard";
import UserDashboard from "./src/components/UserDashboard";

import BookList from "./src/services/BookList";
import AddBookScreen from "./src/bookscreen/AddBookScreen";
import EditBookScreen from "./src/bookscreen/EditBookScreen";
import DeleteBookScreen from "./src/bookscreen/DeleteBookScreen";

import Users from "./src/userscreen/Users";
import AddUserScreen from "./src/userscreen/AddUserScreen";
import EditUserScreen from "./src/userscreen/EditUserScreen";
import DeleteUserScreen from "./src/userscreen/DeleteUserScreen";

import BorrowedList from "./src/screens/BorrowedList";
import PendingRequestScreen from "./src/screens/PendingRequestsScreen";
import BorrowHistoryScreen from "./src/screens/BorrowHistoryScreen";

import BorrowBookScreen from "./src/screens/BorrowBookScreen";
import ReturnBookScreen from "./src/screens/ReturnBookScreen";

import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

export default function App() {
  const [authState, setAuthState] = useState({ token: null, role: null, loading: true, userId: null });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const role = await AsyncStorage.getItem("role");
        const userId = await AsyncStorage.getItem("userId");
        setAuthState({ token, role: role?.toLowerCase(), userId, loading: false });
      } catch (e) {
        console.log("Error reading AsyncStorage:", e);
        setAuthState({ token: null, role: null, userId: null, loading: false });
      }
    };
    checkAuth();
  }, []);

  if (authState.loading) return null;

  let initialRoute;
  if (!authState.token) initialRoute = "Login";
  else if (authState.role === "admin") initialRoute = "AdminDashboard";
  else if (authState.role === "user") initialRoute = "UserDashboard";
  else initialRoute = "Login";

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "Admin Dashboard" }} />
        <Stack.Screen name="UserDashboard">
          {props => <UserDashboard {...props} currentUserId={authState.userId} />}
        </Stack.Screen>

        <Stack.Screen name="Books" component={BookList} options={{ title: "Manage Books" }} />
        <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: "Add Book" }} />
        <Stack.Screen name="EditBook" component={EditBookScreen} options={{ title: "Edit Book" }} />
        <Stack.Screen name="DeleteBook" component={DeleteBookScreen} options={{ title: "Delete Book" }} />

        <Stack.Screen name="Users" component={Users} />
        <Stack.Screen name="AddUser" component={AddUserScreen} />
        <Stack.Screen name="EditUser" component={EditUserScreen} />
        <Stack.Screen name="DeleteUser" component={DeleteUserScreen} />

        <Stack.Screen name="BorrowedList" component={BorrowedList} />
        <Stack.Screen name="PendingRequestsScreen" component={PendingRequestScreen} />
        <Stack.Screen name="BorrowHistory" component={BorrowHistoryScreen} />

        <Stack.Screen name="BorrowBook" component={BorrowBookScreen} />
        <Stack.Screen name="ReturnBook" component={ReturnBookScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
