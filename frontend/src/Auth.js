
// Get the logged-in user from localStorage
export const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Failed to read logged-in user:", error);
    return null;
  }
};

// Get the logged-in user's role
export const getUserRole = () => {
  const user = getLoggedInUser();
  return user?.role || null;
};
