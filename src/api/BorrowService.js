import { BASE_URL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PHY_DEV = `${BASE_URL}/api`;

const BorrowService = {
  // ✅ Helper to get JWT token
  getAuthHeader: async () => {
    const token = await AsyncStorage.getItem("userToken");
    return { Authorization: `Bearer ${token}` };
  },

  // ✅ Borrow Book
  borrowBook: async (bookId, selectedUser = null) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(await BorrowService.getAuthHeader()),
      };

      // ✅ fetch userId and role from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      const role = await AsyncStorage.getItem("role");

      console.log("👤 Logged-in User (from AsyncStorage):", { userId, role });

      // ✅ FIXED: Determine which userId to use
      let borrowForUserId;
      
      if (role?.toLowerCase() === "admin" && selectedUser) {
        // Admin borrowing for a selected user
        borrowForUserId = selectedUser.userId;
        console.log("👑 Admin borrowing for selected user:", selectedUser.name, "userId:", borrowForUserId);
      } else if (role?.toLowerCase() === "admin" && !selectedUser) {
        // Admin must select a user first
        throw new Error("Admin must select a user to borrow for");
      } else {
        // Regular user borrowing for themselves
        borrowForUserId = userId;
        console.log("👤 Regular user borrowing for themselves, userId:", borrowForUserId);
      }

      // ✅ build correct payload
      const payload = {
        bookId,
        userId: borrowForUserId,
      };

      console.log("📗 Borrow Attempt:", {
        loggedInRole: role,
        loggedInUserId: userId,
        borrowForUserId: borrowForUserId,
        selectedUserName: selectedUser ? selectedUser.name : "Self",
        bookId,
      });

      console.log("📤 Borrow Request Payload:", payload);

      const response = await fetch(`${PHY_DEV}/borrow`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!response.ok) {
        const msg = data?.message || text || "Failed to borrow book";
        console.error("❌ Borrow Request Failed:", msg);
        throw new Error(msg);
      }

      console.log("✅ Borrow Response:", data);
      return data;
    } catch (error) {
      console.error("💥 Borrow Error:", error);
      throw error;
    }
  },

  // Request borrow (pending approval)
  requestBorrow: async (bookId) => {
    const headers = await BorrowService.getAuthHeader();
    headers["Content-Type"] = "application/json";

    const res = await fetch(`${PHY_DEV}/borrow/request`, {
      method: "POST",
      headers,
      body: JSON.stringify({ bookId })
    });

    const text = await res.text();
    if (!res.ok) {
      let errMsg;
      try { errMsg = JSON.parse(text).message; } 
      catch { errMsg = text; }
      throw new Error(errMsg);
    }

    return JSON.parse(text);
  },

  // Return a borrowed book
  requestReturn: async (recordId) => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/return/request/${recordId}`, {
      method: "POST",
      headers
    });

    if (!res.ok) throw new Error(`Failed to request return: ${res.status}`);
    return await res.json();
  },

  // Approve borrow (ADMIN)
  approveBorrow: async (recordId) => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/borrow/approve/${recordId}`, {
      method: "POST",
      headers
    });

    if (!res.ok) throw new Error(`Failed to approve borrow: ${res.status}`);
    return await res.json();
  },

  // Approve return (ADMIN)
  approveReturn: async (recordId) => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/return/approve/${recordId}`, {
      method: "POST",
      headers
    });

    if (!res.ok) throw new Error(`Failed to approve return: ${res.status}`);
    return await res.json();
  },

  // Reject borrow (ADMIN)
  rejectBorrow: async (recordId) => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/borrow/reject/${recordId}`, {
      method: "POST",
      headers
    });

    if (!res.ok) throw new Error(`Failed to reject borrow: ${res.status}`);
    return await res.json();
  },

  // Reject return (ADMIN)
  rejectReturn: async (recordId) => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/return/reject/${recordId}`, {
      method: "POST",
      headers
    });

    if (!res.ok) throw new Error(`Failed to reject return: ${res.status}`);
    return await res.json();
  },

  // Get current user's borrow records
  getUserBorrowRecords: async () => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/borrow/records`, { headers });
    if (!res.ok) return [];
    return await res.json();
  },

  // Get all borrowed records (ADMIN)
  getAllBorrowedRecords: async () => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/borrow/all`, { headers });
    if (!res.ok) return [];
    return await res.json();
  },

  // Get all users
  getAllUsers: async () => {
    const headers = await BorrowService.getAuthHeader();
    const res = await fetch(`${PHY_DEV}/users`, { headers });
    
    if (!res.ok) {
      const text = await res.text();
      let errMsg;
      try { errMsg = JSON.parse(text).message; } catch { errMsg = text; }
      throw new Error(errMsg || "Failed to fetch users");
    }

    return await res.json();
  },

  // Get pending borrow requests (ADMIN)
  getPendingBorrows: async () => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/borrow/request`, { headers });
    if (!res.ok) return [];
    return await res.json();
  },

  // Get pending return requests (ADMIN)
  getPendingReturns: async () => {
    const headers = await BorrowService.getAuthHeader();

    const res = await fetch(`${PHY_DEV}/return/request`, { headers });
    if (!res.ok) return [];
    return await res.json();
  }
};

export default BorrowService;