
const PHY_DEV = "http://10.0.2.2:8080/api/books";

//const PHY_DEV = "http://192.168.1.7:8080/api/books";

async function handleResponse(response) {
  const a = response.headers.get("content-type") || "";
  const b = await response.text();

  let data;

  if (a.includes("application/json")) {
    try {
      data = JSON.parse(b);
    } catch {
      data = null;
    }
  } else {
    data = b;
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

const BookService = {

getBooks: async () => {
  const response = await fetch(PHY_DEV);
  const data = await handleResponse(response);

  return Array.isArray(data)
    ? data.map(b => ({
        ...b,
        deleted: b.deleted === true || b.deleted === "true",
      }))
    : [];
},


  getBookById: async (id) => {
    const response = await fetch(`${PHY_DEV}/${id}`);
    return handleResponse(response);
  },

  addBook: async (book) => {
    const response = await fetch(PHY_DEV, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    return handleResponse(response);
  },

  updateBook: async (id, book) => {
    const res = await fetch(`${PHY_DEV}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    return res;  
  },

  deleteBook: async (id) => {
    const response = await fetch(`${PHY_DEV}/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  getBookByIsbn: async (id)=>{
    const response = await fetch(`${PHY_DEV}/isbn/${isbn}`);
    return handleResponse(response);
  },
};

export default BookService;
