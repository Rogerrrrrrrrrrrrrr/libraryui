import { BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${BASE_URL}/api/users`;

async function handleResponse(response) {
  const rawText = await response.text();
  let data;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = rawText;
  }

  if (!response.ok) {
    const message =
      (data && data.message) ||
      (typeof data === "string" && data) ||
      "Something went wrong";
    throw new Error(message);
  }

  return data;
}

// Helper to get Authorization header
async function authHeader() {
  const token = await AsyncStorage.getItem('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const UserService = {

  getUsers: async () => {
    try {
      console.log("Fetching users from:", API_URL);
      const headers = await authHeader();
      const response = await fetch(API_URL, { headers });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error in getUsers:", err);
      throw err;
    }
  },

  getUserById: async (id) => {
    if (!id) throw new Error("Invalid ID for getUserById");
    const headers = await authHeader();
    const response = await fetch(`${API_URL}/${id}`, { headers });
    return handleResponse(response);
  },

  addUser: async (user) => {
    const headers = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },

  updateUser: async (id, user) => {
    if (!id) throw new Error("Invalid ID for updateUser");

    const payload = {
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.password ? { password: user.password } : {}),
    };

    const headers = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  deleteUser: async (id) => {
    if (!id) throw new Error("Invalid ID for deleteUser");

    const headers = await authHeader();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse(response);
  },
};

export default UserService;
