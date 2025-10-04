const API_URL = "http://10.0.2.2:8080/api/users";

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

const UserService = {
  getUsers: async () => {
    try {
      console.log("Fetching users from:", API_URL);
      const response = await fetch(API_URL);
      const data = await handleResponse(response);
      if (Array.isArray(data)) return data;
      return [];
    } catch (err) {
      console.error("Error in getUsers:", err);
      throw err;
    }
  },

  getUserById: async (id) => {
    if (!id) throw new Error("Invalid ID for getUserById");
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
  },

  addUser: async (user) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    };
    if (user.password) payload.password = user.password;

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  deleteUser: async (id) => {
    if (!id) throw new Error("Invalid ID for deleteUser");
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    return handleResponse(response);
  },
};

export default UserService;
