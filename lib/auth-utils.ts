export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    const user = JSON.parse(userStr);

    // Validate user object has required fields
    if (!user.id || !user.username) {
      localStorage.removeItem("user");
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    // Clear corrupted data
    localStorage.removeItem("user");
    return null;
  }
};

export const isCurrentUserAdmin = () => {
  if (typeof window === "undefined") return false;

  try {
    const user = getCurrentUser();
    if (!user) return false;

    // Check if user has admin role
    return user.role === "admin" || user.role === "super_admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Basic token validation
    if (token.split(".").length !== 3) {
      localStorage.removeItem("token");
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Clear all possible cookie variations
    const cookiesToClear = ["token", "auth-token", "session"];
    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    });

    // Clear session storage as well
    sessionStorage.clear();
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

export const verifyToken = (token: string) => {
  try {
    if (!token) return false;

    // Basic token validation
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp > currentTime;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
};

export const isAdmin = (token: string) => {
  try {
    if (!token) return false;

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    return payload.role === "admin" || payload.role === "super_admin";
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
};

// Helper function to force logout and redirect
export const forceLogout = () => {
  clearAuthData();

  // Force a hard redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// Check if current session is valid
export const isSessionValid = () => {
  const user = getCurrentUser();
  const token = getToken();

  if (!user || !token) return false;

  return verifyToken(token);
};
