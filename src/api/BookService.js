import { BASE_URL } from './config';
import AsyncStorage from "@react-native-async-storage/async-storage";

const PHY_DEV = `${BASE_URL}/api/books`;

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) {
    let message = "Something went wrong";
    if (data) {
      if (typeof data === "string") message = data;
      else if (data.message) message = data.message;
      else message = JSON.stringify(data);
    }
    throw new Error(message);
  }

  return data;
};


const BookService = {

  getAuthHeader: async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("No token found");
    return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  },

  getBooks: async () => {
    const headers = await BookService.getAuthHeader();
    const response = await fetch(PHY_DEV, { headers });
    const data = await handleResponse(response);
    return Array.isArray(data)
      ? data.map(b => ({ ...b, deleted: b.deleted === true || b.deleted === "true" }))
      : [];
  },

  getBookById: async (id) => {
    const headers = await BookService.getAuthHeader();
    const response = await fetch(`${PHY_DEV}/${id}`, { headers });
    return handleResponse(response);
  },

  addBook: async (book) => {
    const headers = await BookService.getAuthHeader();
    const response = await fetch(PHY_DEV, {
      method: "POST",
      headers,
      body: JSON.stringify(book),
    });
    return handleResponse(response);
  },

  updateBook: async (id, book) => {
    const headers = await BookService.getAuthHeader();
    const response = await fetch(`${PHY_DEV}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(book),
    });
    return handleResponse(response);
  },

  deleteBook: async (id) => {
    const headers = await BookService.getAuthHeader();
    const response = await fetch(`${PHY_DEV}/${id}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(response);
  },
};

export default BookService;
