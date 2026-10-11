const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : configuredApiUrl
    ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : configuredApiUrl + '/api')
    : 'http://localhost:5000/api';

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

const mockTemples = [
  { id: 1, name: 'Shri Dev Darshan Mandir', location: 'Mathura, Uttar Pradesh', capacity: 10000, image_url: '/assets/hero_temple.png', hours: '5:00 AM - 10:00 PM' },
  { id: 2, name: 'Shri Sai Baba Mandir', location: 'Shirdi, Maharashtra', capacity: 8000, image_url: '/assets/temple_illustration.png', hours: '4:00 AM - 11:00 PM' },
  { id: 3, name: 'Vaishno Devi Mandir', location: 'Katra, Jammu & Kashmir', capacity: 12000, image_url: '/assets/temple_image.png', hours: '3:30 AM - 9:00 PM' },
  { id: 4, name: 'Shri Jagannath Mandir', location: 'Puri, Odisha', capacity: 15000, image_url: '/assets/hero_temple.png', hours: '5:00 AM - 10:30 PM' },
  { id: 5, name: 'Kashi Vishwanath Mandir', location: 'Varanasi, Uttar Pradesh', capacity: 20000, image_url: '/assets/temple_illustration.png', hours: '3:00 AM - 11:00 PM' },
  { id: 6, name: 'Tirupati Balaji Mandir', location: 'Tirupati, Andhra Pradesh', capacity: 25000, image_url: '/assets/temple_image.png', hours: '3:00 AM - 12:00 AM' }
];

const mockBookingSlots = [
  ['04:00:00', '05:00:00'],
  ['05:00:00', '06:00:00'],
  ['06:00:00', '07:00:00'],
  ['07:00:00', '08:00:00'],
  ['16:00:00', '17:00:00'],
  ['17:00:00', '18:00:00'],
  ['18:00:00', '19:00:00'],
  ['19:00:00', '20:00:00']
];

const offlineBookingsKey = () => {
  const user = getStoredUser();
  const identifier = user?.id || user?.email || user?.mobile || 'guest';
  return 'darshansetu_offline_bookings_' + encodeURIComponent(String(identifier));
};

const buildOfflineSampleBookings = () => {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  const dateAfterDays = (days) => {
    const [year, month, day] = today.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
  };
  const baseBooking = {
    temple_name: '[DEMO] Shri Dev Darshan Mandir',
    location: 'Mathura, Uttar Pradesh',
    number_of_visitors: 2,
    darshan_type: 'General Darshan',
    time_slot_id: 101,
    start_time: '04:00:00',
    end_time: '05:00:00',
    qr_code: '',
    local_demo: true
  };

  return [
    { ...baseBooking, booking_id: 'DEMO-UPCOMING-001', booking_date: dateAfterDays(1), booking_status: 'confirmed' },
    { ...baseBooking, booking_id: 'DEMO-COMPLETED-001', booking_date: dateAfterDays(-1), booking_status: 'completed' },
    { ...baseBooking, booking_id: 'DEMO-CANCELLED-001', booking_date: dateAfterDays(2), booking_status: 'cancelled' }
  ];
};

const readOfflineBookings = () => {
  const key = offlineBookingsKey();
  const stored = localStorage.getItem(key);
  if (!stored) {
    const samples = buildOfflineSampleBookings();
    localStorage.setItem(key, JSON.stringify(samples));
    return samples;
  }

  const bookings = JSON.parse(stored);
  if (!Array.isArray(bookings)) {
    throw new Error('Saved offline booking data is invalid');
  }
  return bookings;
};

const saveOfflineBookings = (bookings) => {
  localStorage.setItem(offlineBookingsKey(), JSON.stringify(bookings));
};

const buildMockTempleDetail = (templeId) => {
  const temple = mockTemples.find((item) => Number(item.id) === Number(templeId)) || mockTemples[0];
  return {
    ...temple,
    darshanTypes: [
      { id: 1, name: 'General Darshan', price: 0 },
      { id: 2, name: 'VIP Darshan', price: 250 },
      { id: 3, name: 'Seva Darshan', price: 500 }
    ],
    timeSlots: mockBookingSlots.map(([start_time, end_time], index) => ({
      id: 101 + index,
      start_time,
      end_time,
      capacity: 220,
      booked: 68 + index * 12,
      status: 'available'
    }))
  };
};

const buildMockTimeSlots = () => mockBookingSlots.map(([start_time, end_time], index) => ({
  id: 101 + index,
  start_time,
  end_time,
  capacity: 220,
  booked: 68 + index * 12,
  status: 'available'
}));

const getMockBookingPayload = (path, options = {}) => {
  if (path === '/bookings/temples') {
    return { data: mockTemples };
  }

  if (path.startsWith('/bookings/temples/')) {
    const templeId = path.split('/').at(-1);
    return { data: buildMockTempleDetail(templeId) };
  }

  if (path.startsWith('/bookings/time-slots')) {
    return { data: buildMockTimeSlots() };
  }

  if (path === '/bookings/my-bookings') {
    return { data: readOfflineBookings() };
  }

  if (path === '/bookings/create') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    const bookingId = 'DEMO-' + Date.now().toString().slice(-6);
    const qrCode = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(bookingId);
    const selectedDarshan = buildMockTempleDetail(body.templeId).darshanTypes.find((item) => Number(item.id) === Number(body.darshanTypeId));
    const temple = mockTemples.find((item) => Number(item.id) === Number(body.templeId)) || mockTemples[0];
    const slotIndex = Number(body.timeSlotId) - 101;
    const slot = mockBookingSlots[slotIndex];
    const booking = {
      booking_id: bookingId,
      temple_id: temple.id,
      temple_name: '[DEMO] ' + temple.name,
      location: temple.location,
      darshan_type: selectedDarshan?.name || 'General Darshan',
      number_of_visitors: Number(body.numberOfVisitors || 1),
      booking_date: body.date,
      booking_status: 'confirmed',
      start_time: slot?.[0] || '',
      end_time: slot?.[1] || '',
      time_slot_id: body.timeSlotId,
      qr_code: qrCode,
      local_demo: true
    };
    const existingBookings = readOfflineBookings();
    saveOfflineBookings([booking, ...existingBookings.filter((item) => item.booking_id !== bookingId)]);
    return {
      data: {
        bookingId: bookingId,
        date: body.date,
        time: slot ? slot.map((time) => new Date('1970-01-01T' + time + 'Z').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })).join(' - ') : '',
        temple: mockTemples.find((temple) => Number(temple.id) === Number(body.templeId))?.name || 'Temple Booking',
        darshanType: selectedDarshan?.name || 'General Darshan',
        numberOfVisitors: Number(body.numberOfVisitors || 1),
        qrCode: qrCode,
        total: Number(body.numberOfVisitors || 1) * Number(selectedDarshan?.price || 0)
      }
    };
  }

  const cancelMatch = path.match(/^\/bookings\/([^/]+)\/cancel$/);
  if (cancelMatch && options.method === 'POST') {
    const bookingId = decodeURIComponent(cancelMatch[1]);
    const bookings = readOfflineBookings();
    const updatedBookings = bookings.map((booking) => booking.booking_id === bookingId
      ? { ...booking, booking_status: 'cancelled' }
      : booking);
    if (!updatedBookings.some((booking) => booking.booking_id === bookingId)) {
      return null;
    }
    saveOfflineBookings(updatedBookings);
    return { success: true, message: 'Booking cancelled successfully' };
  }

  if (path.startsWith('/bookings/') && path.endsWith('/qr')) {
    const bookingId = path.split('/')[2];
    const booking = readOfflineBookings().find((item) => item.booking_id === bookingId);
    return {
      data: {
        qr_code: booking?.qr_code || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(bookingId)
      }
    };
  }

  return null;
};

export const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }

  let response;
  try {
    response = await fetch(API_BASE_URL + path, { ...options, headers });
  } catch {
    const fallback = import.meta.env.DEV ? getMockBookingPayload(path, options) : null;
    if (fallback) return fallback;
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
export const getTempleDetails = (templeId) => request('/bookings/temples/' + encodeURIComponent(templeId));

export const getTimeSlots = (templeId, date) => request(
  '/bookings/time-slots?templeId=' + encodeURIComponent(templeId) + '&date=' + encodeURIComponent(date)
);

export const getAvailableDates = () => request('/bookings/available-dates');

export const createBooking = (details) => request('/bookings/create', {
  method: 'POST',
  body: JSON.stringify(details)
});

export const getMyBookings = () => request('/bookings/my-bookings');
export const getBookingQr = (bookingId) => request('/bookings/' + encodeURIComponent(bookingId) + '/qr');
export const verifyQr = (token, details = {}) => request('/bookings/verify-qr', {
  method: 'POST',
  body: JSON.stringify({ token, ...details })
});

export const getNotifications = (params = '') => request('/notifications' + params);

export const getAdminEmergencies = (templeId) => request('/admin/emergency/' + encodeURIComponent(templeId));
export const createAdminEmergency = (details) => request('/admin/emergency/create', {
  method: 'POST',
  body: JSON.stringify(details)
});
export const updateAdminEmergency = (incidentId, details) => request('/admin/emergency/' + encodeURIComponent(incidentId), {
  method: 'PUT',
  body: JSON.stringify(details)
});

export const getAdminStaff = (params = {}) => request('/admin/staff?' + new URLSearchParams(params).toString());
export const getAdminStaffStats = () => request('/admin/staff/stats');
export const getAdminStaffMember = (staffId) => request('/admin/staff/' + encodeURIComponent(staffId));
export const updateAdminStaff = (staffId, details) => request('/admin/staff/' + encodeURIComponent(staffId), { method: 'PUT', body: JSON.stringify(details) });
export const updateAdminStaffStatus = (staffId, status) => request('/admin/staff/' + encodeURIComponent(staffId) + '/status', { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateAdminStaffZone = (staffId, zone) => request('/admin/staff/' + encodeURIComponent(staffId) + '/zone', { method: 'PATCH', body: JSON.stringify({ zone }) });
export const deployAdminStaff = (staffId, details) => request('/admin/staff/' + encodeURIComponent(staffId) + '/deploy', { method: 'PATCH', body: JSON.stringify(details) });
export const removeAdminStaff = (staffId) => request('/admin/staff/' + encodeURIComponent(staffId), { method: 'DELETE' });

export const getLiveCrowd = (templeId) => request('/crowd/live/' + encodeURIComponent(templeId));
export const getCrowdHistory = (templeId, limit = 24) => request(
  '/crowd/history/' + encodeURIComponent(templeId) + '?limit=' + encodeURIComponent(limit)
);

export const markAllNotificationsRead = () => request('/notifications/mark-all-read', {
  method: 'POST'
});
export const markNotificationRead = (notificationId) => request('/notifications/' + encodeURIComponent(notificationId) + '/read', { method: 'PUT' });
export const markNotificationUnread = (notificationId) => request('/notifications/' + encodeURIComponent(notificationId) + '/unread', { method: 'PUT' });
export const deleteNotification = (notificationId) => request('/notifications/' + encodeURIComponent(notificationId), { method: 'DELETE' });
export const getUnreadNotificationCount = () => request('/notifications/unread-count');

export { API_BASE_URL };
