const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getToken = () => localStorage.getItem('darshansetu_token');

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('darshansetu_user') || 'null');
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  if (!session?.token) throw new Error('Authentication response did not include a token');
  localStorage.setItem('darshansetu_token', session.token);
  localStorage.setItem('darshansetu_user', JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem('darshansetu_token');
  localStorage.removeItem('darshansetu_user');
};

export const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Unable to reach the DarshanSetu server');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    throw new Error(payload.message || 'The request failed');
  }

  return payload;
};

export const login = (mobile, password) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ mobile, password })
});

export const signup = (details) => request('/auth/signup', {
  method: 'POST',
  body: JSON.stringify(details)
});

export const getCurrentUser = () => request('/auth/me');

export const getTemples = () => request('/bookings/temples');
export const getTempleDetails = (templeId) => request(`/bookings/temples/${encodeURIComponent(templeId)}`);

export const getTimeSlots = (templeId, date) => request(
  `/bookings/time-slots?templeId=${encodeURIComponent(templeId)}&date=${encodeURIComponent(date)}`
);

export const getAvailableDates = () => request('/bookings/available-dates');

export const createBooking = (details) => request('/bookings/create', {
  method: 'POST',
  body: JSON.stringify(details)
});

export const getMyBookings = () => request('/bookings/my-bookings');
export const getBookingQr = (bookingId) => request(`/bookings/${encodeURIComponent(bookingId)}/qr`);
export const verifyQr = (token, details = {}) => request('/bookings/verify-qr', {
  method: 'POST',
  body: JSON.stringify({ token, ...details })
});

export const getNotifications = (params = '') => request(`/notifications${params}`);

export const getAdminEmergencies = (templeId) => request(`/admin/emergency/${encodeURIComponent(templeId)}`);
export const createAdminEmergency = (details) => request('/admin/emergency/create', {
  method: 'POST',
  body: JSON.stringify(details)
});
export const updateAdminEmergency = (incidentId, details) => request(`/admin/emergency/${encodeURIComponent(incidentId)}`, {
  method: 'PUT',
  body: JSON.stringify(details)
});

export const getAdminStaff = (params = {}) => request(`/admin/staff?${new URLSearchParams(params).toString()}`);
export const getAdminStaffStats = () => request('/admin/staff/stats');
export const getAdminStaffMember = (staffId) => request(`/admin/staff/${encodeURIComponent(staffId)}`);
export const updateAdminStaff = (staffId, details) => request(`/admin/staff/${encodeURIComponent(staffId)}`, { method: 'PUT', body: JSON.stringify(details) });
export const updateAdminStaffStatus = (staffId, status) => request(`/admin/staff/${encodeURIComponent(staffId)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateAdminStaffZone = (staffId, zone) => request(`/admin/staff/${encodeURIComponent(staffId)}/zone`, { method: 'PATCH', body: JSON.stringify({ zone }) });
export const deployAdminStaff = (staffId, details) => request(`/admin/staff/${encodeURIComponent(staffId)}/deploy`, { method: 'PATCH', body: JSON.stringify(details) });
export const removeAdminStaff = (staffId) => request(`/admin/staff/${encodeURIComponent(staffId)}`, { method: 'DELETE' });

export const getLiveCrowd = (templeId) => request(`/crowd/live/${encodeURIComponent(templeId)}`);
export const getCrowdHistory = (templeId, limit = 24) => request(
  `/crowd/history/${encodeURIComponent(templeId)}?limit=${encodeURIComponent(limit)}`
);

export const markAllNotificationsRead = () => request('/notifications/mark-all-read', {
  method: 'POST'
});
export const markNotificationRead = (notificationId) => request(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PUT' });
export const markNotificationUnread = (notificationId) => request(`/notifications/${encodeURIComponent(notificationId)}/unread`, { method: 'PUT' });
export const deleteNotification = (notificationId) => request(`/notifications/${encodeURIComponent(notificationId)}`, { method: 'DELETE' });
export const getUnreadNotificationCount = () => request('/notifications/unread-count');

export { API_BASE_URL };
