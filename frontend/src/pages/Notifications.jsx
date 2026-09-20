import React, { useEffect, useMemo, useState } from 'react';
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead, markNotificationUnread } from '../api/client';
import { Header, Sidebar } from './AdminSection';
import '../styles/admin-section.css';
import '../styles/emergency-center.css';
import '../styles/notifications.css';

const fallbackNotifications = [
  { id: 'demo-1004', title: 'Emergency Reported', message: 'Medical Emergency reported at Gate 3. Patient found unwell.', category: 'Emergency', reference: 'INC-1004', type: 'Medical Emergency', created_at: '2026-09-19T09:24:00', priority: 'High Priority', status: 'Critical', read_status: 0 },
  { id: 'demo-deployment', title: 'Staff Deployed', message: 'Medical Response Team deployed to Gate 3 for incident INC-1004.', category: 'Staff & Security', reference: 'Deployment', related_staff: 'Pooja Rao', created_at: '2026-09-19T09:18:00', priority: 'Normal', status: 'Success', read_status: 0 },
  { id: 'demo-system', title: 'System Update', message: 'The queue management system has been updated with real-time data.', category: 'System', reference: 'Version 2.4.1', created_at: '2026-09-19T08:45:00', priority: 'Normal', status: 'Info', read_status: 1 },
  { id: 'demo-booking', title: 'New Booking', message: 'A new darshan booking has been confirmed for 19 Sep 2026, 11:00 AM.', category: 'Bookings', reference: '#DBK-4587', created_at: '2026-09-19T08:32:00', priority: 'Normal', status: 'Update', read_status: 1 },
  { id: 'demo-staff', title: 'Staff Status Changed', message: 'Ravi Das is now in Emergency Deployment status.', category: 'Staff & Security', reference: 'ST-022', related_staff: 'Ravi Das', created_at: '2026-09-19T08:15:00', priority: 'Critical', status: 'Critical', read_status: 0 },
  { id: 'demo-resolved', title: 'Incident Resolved', message: 'Crowd Surge incident INC-1023 has been resolved.', category: 'Emergency', reference: 'Queue Zone B', created_at: '2026-09-19T07:50:00', priority: 'Normal', status: 'Resolved', read_status: 1 }
];

const categoryTabs = ['All', 'System', 'Emergency', 'Updates', 'Info'];
const filterOptions = ['All', 'Unread', 'Read', 'Emergency', 'System', 'Bookings', 'Staff & Security', 'Updates', 'Info'];

function notificationCategory(item) {
  if (item.category) return item.category;
  if (item.notification_type === 'alert') return 'Emergency';
  if (item.notification_type === 'booking') return 'Bookings';
  if (item.notification_type === 'queue') return 'Updates';
  return 'System';
}
function categoryClass(category) { return category.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

function notificationTime(value) { return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function iconFor(item) { return notificationCategory(item) === 'Emergency' ? '!' : notificationCategory(item) === 'System' ? '⚙' : notificationCategory(item) === 'Bookings' ? '▣' : notificationCategory(item) === 'Staff & Security' ? '♙' : '✓'; }

function NotificationModal({ title, children, onClose }) {
  return <div className="notification-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="notification-modal" role="dialog" aria-modal="true" aria-labelledby="notification-modal-title" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="notification-modal-title">{title}</h2><button type="button" aria-label="Close" onClick={onClose}>×</button></header>{children}</div></div>;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [menuId, setMenuId] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const pageSize = 6;
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };

  useEffect(() => {
    getNotifications('?limit=100').then((response) => {
      const serverItems = response.data?.notifications || [];
      if (serverItems.length) setNotifications(serverItems.map((item) => ({ ...item, category: notificationCategory(item), message: item.message || 'Notification received.' })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((item) => !Number(item.read_status)).length;
  const filtered = useMemo(() => notifications.filter((item) => {
    const category = notificationCategory(item);
    const matchesTab = activeTab === 'All' || category === activeTab || (activeTab === 'Updates' && ['Bookings', 'Staff & Security'].includes(category));
    const matchesFilter = filter === 'All' || (filter === 'Unread' && !Number(item.read_status)) || (filter === 'Read' && Number(item.read_status)) || category === filter;
    const query = search.trim().toLowerCase();
    return matchesTab && matchesFilter && (!query || [item.title, item.message, category, item.reference, item.related_staff].filter(Boolean).join(' ').toLowerCase().includes(query));
  }), [activeTab, filter, notifications, search]);
  const pageCount = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  const updateRead = async (item, read) => {
    setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_status: read ? 1 : 0 } : entry));
    if (!String(item.id).startsWith('demo-')) { try { await (read ? markNotificationRead(item.id) : markNotificationUnread(item.id)); } catch { notify('Notification could not be updated'); } }
    notify(read ? 'Notification marked as read' : 'Notification marked as unread'); setMenuId(null);
  };
  const remove = async (item) => {
    if (!String(item.id).startsWith('demo-')) { try { await deleteNotification(item.id); } catch { notify('Notification could not be deleted'); return; } }
    setNotifications((current) => current.filter((entry) => entry.id !== item.id)); setModal(null); notify('Notification deleted');
  };
  const markAllRead = async () => { setNotifications((current) => current.map((item) => ({ ...item, read_status: 1 }))); try { await markAllNotificationsRead(); } catch {} notify('All notifications marked as read'); };
  const clearFilters = () => { setActiveTab('All'); setFilter('All'); setSearch(''); setPage(1); notify('Filters cleared'); };

  return <div className="admin-section-page"><Sidebar /><main className="admin-section-main"><Header title="Notifications" /><section className="notifications-admin-page"><div className="notifications-admin-intro"><div><span className="admin-section-kicker">DARSHANSETU / ADMIN OPERATIONS</span><h1>Notifications</h1><p>Stay updated with the latest alerts, system messages and important updates.</p></div><div className="notifications-temple"><strong>Banke Bihari Temple</strong><span>Vrindavan · AU</span></div></div><article className="notifications-card"><header className="notifications-card-header"><div><h2>Notifications <span>{unreadCount} unread</span></h2><p>Operational alerts and updates from across the temple.</p></div><button type="button" className="notifications-mark-all" onClick={markAllRead}>Mark all as read</button></header><div className="notifications-toolbar"><div className="notification-tabs" role="tablist">{categoryTabs.map((tab) => <button type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}>{tab}</button>)}</div><div className="notification-tools"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search notifications..." aria-label="Search notifications" /><select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} aria-label="Filter notifications">{filterOptions.map((value) => <option key={value}>{value}</option>)}</select></div></div>{loading ? <div className="notification-list">{[1, 2, 3].map((item) => <div className="notification-skeleton" key={item} />)}</div> : visible.length ? <div className="notification-list">{visible.map((item) => { const category = notificationCategory(item); return <article className={`notification-item ${Number(item.read_status) ? '' : 'unread'}`} key={item.id} onClick={() => setModal({ type: 'details', item })}><div className={`notification-item-icon category-${categoryClass(category)}`} aria-hidden="true">{iconFor(item)}</div><div className="notification-content"><div className="notification-title-row"><h3>{item.title}</h3>{!Number(item.read_status) && <i className="notification-unread-dot" aria-label="Unread" />}</div><p className="notification-description">{item.message}</p><div className="notification-meta"><span>{item.reference || category}</span><span>{category}</span>{item.related_staff && <span>{item.related_staff}</span>}</div></div><div className="notification-side"><time>{notificationTime(item.created_at)}</time><span className={`notification-badge badge-${String(item.status || 'Info').toLowerCase().replaceAll(' ', '-')}`}>{item.priority || item.status || 'Info'}</span><button type="button" className="notification-menu-button" aria-label={`Actions for ${item.title}`} onClick={(event) => { event.stopPropagation(); setMenuId(menuId === item.id ? null : item.id); }}>•••</button>{menuId === item.id && <div className="notification-menu" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => updateRead(item, !Number(item.read_status))}>{Number(item.read_status) ? 'Mark as unread' : 'Mark as read'}</button><button type="button" onClick={() => { setModal({ type: 'details', item }); setMenuId(null); }}>View details</button><button type="button" onClick={() => { setModal({ type: 'delete', item }); setMenuId(null); }}>Delete</button></div>}</div></article>; })}</div> : <div className="notifications-empty"><strong>◎</strong><h3>No notifications found</h3><p>There are no notifications matching your current filters.</p><button type="button" onClick={clearFilters}>Clear Filters</button></div>}<footer className="notifications-pagination"><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} of {filtered.length} notifications</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><b>{page} / {pageCount}</b><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></footer></article>{modal?.type === 'details' && <NotificationModal title="Notification Details" onClose={() => setModal(null)}><div className="notification-details">{[['Title', modal.item.title], ['Category', notificationCategory(modal.item)], ['Description', modal.item.message], ['Reference', modal.item.reference || 'Not available'], ['Created At', notificationTime(modal.item.created_at)], ['Priority', modal.item.priority || 'Normal'], ['Status', modal.item.status || 'Info'], ['Related Staff', modal.item.related_staff || 'Not available']].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className="notification-modal-actions"><button type="button" onClick={() => setModal(null)}>Close</button>{!Number(modal.item.read_status) && <button type="button" className="primary" onClick={() => { updateRead(modal.item, true); setModal(null); }}>Mark as read</button>}</div></NotificationModal>}{modal?.type === 'delete' && <NotificationModal title="Delete Notification?" onClose={() => setModal(null)}><div className="notification-confirm"><p>This notification will be permanently removed.</p><div className="notification-modal-actions"><button type="button" onClick={() => setModal(null)}>Cancel</button><button type="button" className="danger" onClick={() => remove(modal.item)}>Delete</button></div></div></NotificationModal>}{toast && <div className="admin-emergency-toast" role="status">{toast}</div>}</section></main></div>;
}
