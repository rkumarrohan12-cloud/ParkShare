const API_BASE_URL = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("ps_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
};

export const authAPI = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  signup: (userData) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  me: () => request("/auth/me"),
};

export const parkingAPI = {
  // Get all active parking spaces
  getAll: () =>
    request("/parking"),

  // Get parking spaces available for
  // a specific start/end time
  getAllWithAvailability: (
    start,
    end
  ) =>
    request(
      `/parking?start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}`
    ),

  getById: (id) =>
    request(`/parking/${id}`),
};

export const bookingAPI = {
  create: (bookingData) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify(
        bookingData
      ),
    }),

  getMyBookings: () =>
    request("/bookings"),

  getById: (id) =>
    request(`/bookings/${id}`),

  cancel: (id) =>
    request(`/bookings/${id}/cancel`, {
      method: "PATCH",
    }),
};

export const favoriteAPI = {
  getAll: () =>
    request("/favorites"),

  add: (parkingSpaceId) =>
    request("/favorites", {
      method: "POST",
      body: JSON.stringify({
        parkingSpaceId,
      }),
    }),

  remove: (parkingSpaceId) =>
    request(
      `/favorites/${parkingSpaceId}`,
      {
        method: "DELETE",
      }
    ),
};

export const paymentAPI = {
  getAll: () =>
    request("/payments"),

  create: (paymentData) =>
    request("/payments", {
      method: "POST",
      body: JSON.stringify(
        paymentData
      ),
    }),
};

export const ownerAPI = {
  getDashboard: () =>
    request("/owner/dashboard"),

  getSlots: () =>
    request("/owner/parking"),

  createParking: (parkingData) =>
    request("/owner/parking", {
      method: "POST",
      body: JSON.stringify(
        parkingData
      ),
    }),

  updateParking: (
    id,
    parkingData
  ) =>
    request(
      `/owner/parking/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(
          parkingData
        ),
      }
    ),

  deleteParking: (id) =>
    request(
      `/owner/parking/${id}`,
      {
        method: "DELETE",
      }
    ),

  getBookings: () =>
    request("/owner/bookings"),

  updateBookingStatus: (
    id,
    status
  ) =>
    request(
      `/owner/bookings/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      }
    ),

  getEarnings: () =>
    request("/owner/earnings"),
};

export const adminAPI = {
  getUsers: () =>
    request("/admin/users"),

  getParking: () =>
    request("/admin/parking"),

  getBookings: () =>
    request("/admin/bookings"),

  getStats: () =>
    request("/admin/stats"),

  updateUserStatus: (
    id,
    status
  ) =>
    request(
      `/admin/users/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      }
    ),

  updateParkingStatus: (
    id,
    isActive
  ) =>
    request(
      `/admin/parking/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          isActive,
        }),
      }
    ),

  updateBookingStatus: (
    id,
    status
  ) =>
    request(
      `/admin/bookings/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      }
    ),
};