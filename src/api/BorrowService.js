const PHY_DEV = "http://10.0.2.2:8080/api";

const BorrowService = {
  getAllBorrowed: async () => {
    try {
      const res = await fetch(`${PHY_DEV}/borrowed`);
      if (!res.ok) throw new Error(`Failed to fetch borrowed books: ${res.status}`);
      return await res.json(); 
    } catch (err) {
      console.error("Fetch borrowed error:", err.message || err);
      throw err;
    }
  },

  getAllUsers: async () => {
    try {
      const res = await fetch(`${PHY_DEV}/users`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn("User fetch error:", err.message);
      return [];
    }
  },

  getRecordsByUser: async (userId) => {
    try {
      const res = await fetch(`${PHY_DEV}/user/${userId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error(`Error fetching records for user ${userId}:`, err.message);
      return [];
    }
  },

  borrowBook: async (userId, bookId) => {
    try {
      const res = await fetch(`${PHY_DEV}/borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId }),
      });
      if (!res.ok) throw new Error(`Failed to borrow book: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Borrow book error:`, err.message);
      throw err;
    }
  },

  returnBook: async (recordId) => {
    try {
      const res = await fetch(`${PHY_DEV}/${recordId}/return`, { method: "PUT" });
      if (!res.ok) throw new Error(`Failed to return book: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Return book error for record ${recordId}:`, err.message);
      throw err;
    }
  },

  requestBorrow: async (userId, bookId) => {
  try {
    const res = await fetch(`${PHY_DEV}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bookId }),
    });

    const text = await res.text(); 

    if (!res.ok) {
      let errorMsg;
      try {
        const errJson = JSON.parse(text);
        errorMsg = errJson.message || JSON.stringify(errJson);
      } catch {
        errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    return JSON.parse(text); 
  } catch (err) {
    console.error(`Request borrow error:`, err.message);
    throw err; 
  }
},


  approveBorrow: async (recordId) => {
    try {
      const res = await fetch(`${PHY_DEV}/${recordId}/approve-borrow`, { method: "PUT" });
      if (!res.ok) throw new Error(`Failed to approve borrow: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Approve borrow error:`, err.message);
      throw err;
    }
  },

  requestReturn: async (recordId) => {
    try {
      const res = await fetch(`${PHY_DEV}/${recordId}/request-return`, { method: "PUT" });
      if (!res.ok) throw new Error(`Failed to request return: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Request return error:`, err.message);
      throw err;
    }
  },

  approveReturn: async (recordId) => {
    try {
      const res = await fetch(`${PHY_DEV}/${recordId}/approve-return`, { method: "PUT" });
      if (!res.ok) throw new Error(`Failed to approve return: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Approve return error:`, err.message);
      throw err;
    }
  },

  rejectBorrow: async (recordId) => {
    try {
      const res = await fetch(`${PHY_DEV}/${recordId}/reject-borrow`, { method: "PUT" });
      if (!res.ok) throw new Error(`Failed to reject borrow: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Reject borrow error:`, err.message);
      throw err;
    }
  },

  rejectReturn: async (recordId) => {
    try {
      const res = await fetch(`${PHY_DEV}/${recordId}/reject-return`, { method: "PUT" });
      if (!res.ok) throw new Error(`Failed to reject return: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Reject return error:`, err.message);
      throw err;
    }
  },

  getPendingBorrows: async () => {
    try {
      const res = await fetch(`${PHY_DEV}/pending-borrows`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("Fetch pending borrows error:", err.message);
      return [];
    }
  },

  getPendingReturns: async () => {
  try {
    const res = await fetch(`${PHY_DEV}/pending-returns`);
    return res.ok ? await res.json() : [];
  } catch (err) {
    console.error("Fetch pending returns error:", err.message);
    return [];
  }
},

};

export default BorrowService;
