import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getBookingQr, getMyBookings, request } from '../api/client';
import '../styles/qr_pass.css';
import '../styles/design-system.css';
import '../styles/my-bookings.css';
import darshanSetuLogo from '../../assets/DarshanSetu_Logo.png';

const formatDate = (date) => date ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) : 'Date unavailable';
const formatTime = (value) => value ? value.slice(0, 5) : 'Time unavailable';
const normalizeStatus = (status) => String(status || 'pending').trim().toLowerCase().replace(/[\s-]+/g, '_');
const getBookingStatus = (booking) => {
  const status = normalizeStatus(booking.booking_status || booking.bookingStatus || booking.status);
  if (status === 'canceled') return 'cancelled';
  if (status === 'complete') return 'completed';
  return status;
};
const getBookingCategory = (booking) => {
  const status = getBookingStatus(booking);
  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  if (status === 'confirmed' || status === 'pending') return 'upcoming';
  return 'other';
};

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const labels = { confirmed: 'Confirmed', cancelled: 'Cancelled', pending: 'Pending', completed: 'Completed' };
  const icons = { confirmed: '✓', cancelled: '×', pending: '•', completed: '✓' };
  return <span className={`booking-status booking-status--${normalized}`}><b aria-hidden="true">{icons[normalized] || '•'}</b>{labels[normalized] || status || 'Pending'}</span>;
}

function Sidebar() {
  const navigate = useNavigate();
  const logout = () => { clearSession(); navigate('/login', { replace: true }); };
  return <aside className="my-bookings-sidebar">
    <Link className="my-bookings-brand" to="/"><img src={darshanSetuLogo} alt="DarshanSetu" /><span>DarshanSetu<small>Divine Connect</small></span></Link>
    <nav aria-label="Main navigation" className="my-bookings-nav">
      <Link to="/">⌂ <span>Home</span></Link><Link to="/temples">♜ <span>Temples</span></Link><Link to="/darshan-booking">▣ <span>Darshan Booking</span></Link><Link className="active" to="/my-bookings" aria-current="page">◷ <span>My Bookings</span></Link><Link to="/qr-pass">▤ <span>QR Pass</span></Link><Link to="/profile">♙ <span>Profile</span></Link><Link to="/help">? <span>Help &amp; Support</span></Link>
    </nav>
    <p className="sidebar-blessing">May your journey be safe and blessed</p>
    <button type="button" className="my-bookings-logout" onClick={logout}>↪ <span>Logout</span></button>
  </aside>;
}

function BookingSkeleton() {
  return <div className="booking-skeletons" aria-label="Loading bookings"><div /><div /><div /></div>;
}

function BookingCard({ booking, onViewQr, onCancel }) {
  const status = getBookingStatus(booking);
  const canCancel = status !== 'cancelled' && status !== 'completed';
  return <article className="my-booking-card">
    {booking.local_demo && <p className="offline-booking-note offline-booking-note--card">Offline demo only — not confirmed by a temple.</p>}
    <div className="booking-card-image"><img src={booking.image_url || '/assets/hero_temple.png'} alt="" /></div>
    <div className="my-booking-main"><div className="booking-card-heading"><div><p className="booking-eyebrow">DARSHAN BOOKING</p><h2>{booking.temple_name}</h2><p className="booking-location">⌖ {booking.location || 'Temple location'}</p></div><StatusBadge status={booking.booking_status} /></div>
      <div className="booking-details-grid"><span><small>Date</small><strong>{formatDate(booking.booking_date)}</strong></span><span><small>Time</small><strong>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</strong></span><span><small>Devotees</small><strong>{booking.number_of_visitors} {Number(booking.number_of_visitors) === 1 ? 'Devotee' : 'Devotees'}</strong></span><span><small>Booking ID</small><strong>{booking.booking_id}</strong></span><span><small>Darshan Type</small><strong>{booking.darshan_type || 'General Darshan'}</strong></span></div>
      <div className="booking-card-actions"><button type="button" className="booking-action booking-action--primary" onClick={() => onViewQr(booking)}>▣ <span>View QR</span></button>{canCancel && <button type="button" className="booking-action" onClick={() => onCancel(booking)}>× <span>Cancel Booking</span></button>}</div>
    </div>
  </article>;
}

function QrModal({ booking, onClose }) {
  const share = () => navigator.share?.({ title: 'DarshanSetu booking', text: `${booking.temple_name} · ${booking.booking_id}` });
  return <div className="my-bookings-modal-backdrop"><section className="my-bookings-modal" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title"><button type="button" className="my-bookings-modal-close" onClick={onClose} aria-label="Close QR pass">×</button><div className="modal-pass-header"><p className="booking-eyebrow">DARSHAN PASS</p><h2 id="qr-modal-title">{booking.temple_name}</h2><p>{booking.location || 'Temple visit'}</p></div><div className="modal-pass-content"><div className="modal-pass-details"><span>Booking ID<strong>{booking.booking_id}</strong></span><span>Date<strong>{formatDate(booking.booking_date)}</strong></span><span>Time<strong>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</strong></span><span>Devotees<strong>{booking.number_of_visitors}</strong></span><span>Darshan Type<strong>{booking.darshan_type || 'General Darshan'}</strong></span></div><div className="modal-qr"><img src={booking.qr_code} alt={`QR pass for ${booking.booking_id}`} /><p>Scan this QR code at temple entry</p></div></div><div className="modal-actions"><a className="booking-action booking-action--primary" href={booking.qr_code} download={`${booking.booking_id}.png`}>⇩ <span>Download QR</span></a><button type="button" className="booking-action" onClick={share}>↗ <span>Share Booking</span></button></div></section></div>;
}

function CancelModal({ booking, onClose, onConfirm, loading }) {
  return <div className="my-bookings-modal-backdrop"><section className="my-bookings-confirm" role="dialog" aria-modal="true" aria-labelledby="cancel-title"><div className="confirm-icon">!</div><h2 id="cancel-title">Cancel Booking?</h2><p>Are you sure you want to cancel this darshan booking?</p><strong>{booking.temple_name}</strong><div className="modal-actions"><button type="button" className="booking-action" onClick={onClose}>Keep Booking</button><button type="button" className="booking-action booking-action--danger" onClick={onConfirm} disabled={loading}>{loading ? 'Cancelling...' : 'Yes, Cancel Booking'}</button></div></section></div>;
}

export default function MyQueue() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const hasLocalDemoBookings = useMemo(() => bookings.some((booking) => booking.local_demo || String(booking.booking_id || '').startsWith('DEMO-')), [bookings]);

  const loadBookings = () => { setLoading(true); setError(''); return getMyBookings().then(({ data }) => setBookings(data || [])).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)); };
  useEffect(() => { loadBookings(); }, []);

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    return filter === 'all' || getBookingCategory(booking) === filter;
  }), [bookings, filter]);

  const viewQr = async (booking) => { setError(''); try { const response = await getBookingQr(booking.booking_id); setSelected({ ...booking, ...response.data }); } catch (requestError) { setError(requestError.message); } };
  const cancelBooking = async () => { setCancelLoading(true); try { await request(`/bookings/${encodeURIComponent(cancelTarget.booking_id)}/cancel`, { method: 'POST' }); setBookings((current) => current.map((booking) => booking.booking_id === cancelTarget.booking_id ? { ...booking, booking_status: 'cancelled' } : booking)); setCancelTarget(null); setNotice('Booking cancelled successfully.'); await loadBookings(); } catch (requestError) { setError(requestError.message); } finally { setCancelLoading(false); } };

  const tabs = [['all', '▤', 'All Bookings'], ['upcoming', '◷', 'Upcoming'], ['completed', '✓', 'Completed'], ['cancelled', '×', 'Cancelled']];
  const emptyMessages = {
    all: ['No bookings found', 'Your darshan bookings will appear here.'],
    upcoming: ['No upcoming bookings', 'Confirmed and pending darshan bookings will appear here.'],
    completed: ['No completed bookings', 'Completed darshan visits will appear here.'],
    cancelled: ['No cancelled bookings', 'Bookings you cancel will appear here.']
  };
  return <div className="my-bookings-app"><Sidebar /><main className="my-bookings-content"><header className="my-bookings-header"><div><p className="booking-eyebrow">YOUR TEMPLE VISITS</p><h1>My Bookings</h1><p>View and manage all your darshan bookings</p></div><div className="my-bookings-user"><button type="button" aria-label="Notifications">♧<b>2</b></button><span className="user-avatar">A</span><span className="user-name">Devotee</span></div></header>{notice && <div className="booking-notice" role="status">✓ {notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}{error && <div className="booking-error" role="alert">{error === 'Unable to reach the DarshanSetu server' ? 'Could not connect to the bookings server. Your bookings have not been loaded; please retry when the server is available.' : error}<button type="button" onClick={loadBookings}>Retry</button></div>}<div className="booking-tabs" role="tablist" aria-label="Filter bookings">{tabs.map(([value, icon, label]) => <button type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}><span aria-hidden="true">{icon}</span>{label}<b>{value === 'all' ? bookings.length : bookings.filter((booking) => getBookingCategory(booking) === value).length}</b></button>)}</div>{loading ? <BookingSkeleton /> : error ? null : filteredBookings.length === 0 ? <section className="my-bookings-empty"><div className="empty-icon">◫</div><h2>{emptyMessages[filter][0]}</h2><p>{emptyMessages[filter][1]}</p><button type="button" className="booking-empty-cta" onClick={() => navigate('/darshan-booking')}>Book Darshan <span>→</span></button></section> : <section className="my-bookings-list" aria-live="polite">{filteredBookings.map((booking) => <BookingCard key={booking.booking_id} booking={booking} onViewQr={viewQr} onCancel={setCancelTarget} />)}</section>}{selected && <QrModal booking={selected} onClose={() => setSelected(null)} />}{cancelTarget && <CancelModal booking={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={cancelBooking} loading={cancelLoading} />}</main></div>;
}
