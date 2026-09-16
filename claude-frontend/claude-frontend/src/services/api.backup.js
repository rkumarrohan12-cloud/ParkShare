// Thin localStorage-backed "API" layer. Swap these functions for real
// HTTP calls later without touching component code.

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

export const db = {
  getUsers: () => read('ps_users', []),
  setUsers: (v) => write('ps_users', v),

  getParking: () => read('ps_parking', []),
  setParking: (v) => write('ps_parking', v),

  getBookings: () => read('ps_bookings', []),
  setBookings: (v) => write('ps_bookings', v),

  getFavorites: () => read('ps_favorites', []),
  setFavorites: (v) => write('ps_favorites', v),

  getPayments: () => read('ps_payments', []),
  setPayments: (v) => write('ps_payments', v),

  getSession: () => read('ps_session', null),
  setSession: (v) => write('ps_session', v),
  clearSession: () => localStorage.removeItem('ps_session'),
}
