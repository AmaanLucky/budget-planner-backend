import axios from "axios";

const API_BASE_URL = "http://localhost:5001/expenses"; // 🔹 Ensure backend is running

// 🔹 Function to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ No token found! Unauthorized request.");
    return null; // 🔹 Prevent unauthorized requests
  }
  return { Authorization: `Bearer ${token}` };
};

// ✅ Fetch all expenses (Only for logged-in user)
export const getExpenses = async () => {
  try {
    const headers = getAuthHeader();
    if (!headers) return []; // 🔹 Stop request if no token

    const response = await axios.get(API_BASE_URL, { headers });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return [];
  }
};

// ✅ Add a new expense
export const addExpense = async (expense) => {
  try {
    const headers = getAuthHeader();
    if (!headers) return null;

    const response = await axios.post(`${API_BASE_URL}/add`, expense, { headers });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return null;
  }
};

// ✅ Delete an expense
export const deleteExpense = async (expenseId) => {
  try {
    const headers = getAuthHeader();
    if (!headers) return false;

    await axios.delete(`${API_BASE_URL}/${expenseId}`, { headers });
    return true;
  } catch (error) {
    handleAuthError(error);
    return false;
  }
};

// ✅ Update an expense
export const updateExpense = async (expenseId, updatedExpense) => {
  try {
    const headers = getAuthHeader();
    if (!headers) return null;

    const response = await axios.put(`${API_BASE_URL}/${expenseId}`, updatedExpense, { headers });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return null;
  }
};

// 🔹 Handle authentication errors (Auto logout if token is invalid)
const handleAuthError = (error) => {
  console.error("❌ API Error:", error.response?.data || error.message);

  if (error.response?.status === 401) {
    console.warn("⚠️ Unauthorized! Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload(); // 🔹 Force logout & refresh
  }
};
