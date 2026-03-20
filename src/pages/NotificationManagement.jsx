import React, { useState, useEffect } from 'react';
import { Bell, User, Globe, Send, History, AlertCircle, CheckCircle2, Loader2, Search, Edit, Trash2, X } from 'lucide-react';
import notificationApi from '../api/notificationApi';
import Pagination from '../components/Pagination';

const NotificationManagement = () => {
    const [activeTab, setActiveTab] = useState('create');
    const [notifType, setNotifType] = useState('global'); // 'global' or 'personal'
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        email: '',
        isGlobal: true
    });
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        message: '',
        email: '',
        type: 'General',
        isGlobal: true
    });

    // Delete Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingNotificationId, setDeletingNotificationId] = useState(null);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
        setCurrentPage(1); // Reset page on tab change
    }, [activeTab]);

    useEffect(() => {
        setCurrentPage(1); // Reset page on search
    }, [searchTerm]);

    useEffect(() => {
        if (status.message) {
            const timer = setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    // Handle scroll lock when modals are open
    useEffect(() => {
        if (isEditModalOpen || isDeleteModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isEditModalOpen, isDeleteModalOpen]);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await notificationApi.getAdminNotificationHistory();
            setHistory(data?.data || data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            setStatus({ type: 'error', message: 'Failed to load notification history' });
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            let response;
            if (notifType === 'global') {
                response = await notificationApi.createGlobalNotification({
                    title: formData.title,
                    message: formData.message,
                    isGlobal: true
                });
            } else {
                if (!formData.email) {
                    throw new Error('User Email is required for personal notifications');
                }
                response = await notificationApi.createPersonalNotification({
                    email: formData.email,
                    title: formData.title,
                    message: formData.message
                });
            }

            setStatus({ type: 'success', message: 'Notification sent successfully!' });
            setFormData({ title: '', message: '', email: '', isGlobal: true });
            
            // If in history tab, refresh
            if (activeTab === 'history') {
                fetchHistory();
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || error.message || 'Failed to send notification' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (notification) => {
        setEditingNotification(notification);
        setEditFormData({
            title: notification.title || '',
            message: notification.message || '',
            email: notification.userId?.email || notification.email || '',
            type: notification.type || 'General',
            isGlobal: notification.isGlobal
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await notificationApi.updateNotification(editingNotification._id, editFormData);
            setStatus({ type: 'success', message: 'Notification updated successfully!' });
            setIsEditModalOpen(false);
            fetchHistory();
        } catch (error) {
            console.error('Error updating notification:', error);
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to update notification' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeletingNotificationId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await notificationApi.deleteNotification(deletingNotificationId);
            setStatus({ type: 'success', message: 'Notification deleted successfully!' });
            setIsDeleteModalOpen(false);
            fetchHistory();
        } catch (error) {
            console.error('Error deleting notification:', error);
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to delete notification' 
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.userId?.email || item.userId?.fullName)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistoryItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className=" max-w-6xl mx-auto min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="text-blue-600" />
                    Notification Management
                </h1>
                <p className="text-gray-500 mt-1">Create and manage alerts for your users.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`px-6 py-3 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === 'create' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Send size={18} />
                    Create Notification
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === 'history' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <History size={18} />
                    Admin History
                </button>
            </div>

            {/* Status Alert */}
            {status.message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in duration-300 ${
                    status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}

            {activeTab === 'create' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 max-w-6xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Toggle */}
                        <div className="flex gap-4 p-1 bg-gray-50 rounded-lg w-fit">
                            <button
                                type="button"
                                onClick={() => setNotifType('global')}
                                className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all ${
                                    notifType === 'global' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Globe size={16} />
                                Global Alert
                            </button>
                            <button
                                type="button"
                                onClick={() => setNotifType('personal')}
                                className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all ${
                                    notifType === 'personal' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <User size={16} />
                                Targeted User
                            </button>
                        </div>

                        {notifType === 'personal' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">User Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required={notifType === 'personal'}
                                    placeholder="Enter user email address..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="E.g., Important Update"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Message Content</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                placeholder="Details about this notification..."
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto md:px-12 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-bold py-4 rounded-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Send size={20} />
                                )}
                                {loading ? 'Sending...' : 'Dispatch Notification'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* History Tab */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all"
                            />
                        </div>
                        <button 
                            onClick={fetchHistory}
                            disabled={historyLoading}
                            className="text-sm text-blue-600 font-medium hover:underline cursor-pointer disabled:text-gray-400 flex items-center gap-1"
                        >
                            {historyLoading && <Loader2 className="animate-spin" size={14} />}
                            Refresh
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-blue-600" />
                                                Loading records...
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentHistoryItems.length > 0 ? (
                                    currentHistoryItems.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.isGlobal 
                                                    ? 'bg-blue-50 text-blue-700' 
                                                    : 'bg-purple-50 text-purple-700'
                                                }`}>
                                                    {item.isGlobal ? <Globe size={12} /> : <User size={12} />}
                                                    {item.isGlobal ? 'GLOBAL' : 'PERSONAL'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.title}</div>
                                                <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.message}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.isGlobal ? (
                                                    <span className="text-sm text-gray-400 italic">All Users</span>
                                                ) : (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                                                            {item.userId?.fullName || 'User'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-medium font-mono truncate max-w-[150px]">
                                                            {item.userId?.email || 'N/A'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEditClick(item)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit Notification"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(item._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Notification"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                            No notifications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination 
                        currentPage={currentPage}
                        totalItems={filteredHistory.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Edit className="text-blue-600" size={24} />
                                Edit Notification
                            </h2>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {!editFormData.isGlobal && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    <label className="text-sm font-semibold text-gray-700">Target User Email</label>
                                    <input
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                        required={!editFormData.isGlobal}
                                        placeholder="Enter user email..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Message</label>
                                <textarea
                                    value={editFormData.message}
                                    onChange={(e) => setEditFormData({...editFormData, message: e.target.value})}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Visibility</label>
                                <div className="flex items-center gap-2 h-[50px]">
                                    <input
                                        type="checkbox"
                                        id="isGlobalEdit"
                                        checked={editFormData.isGlobal}
                                        onChange={(e) => setEditFormData({...editFormData, isGlobal: e.target.checked})}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                                    />
                                    <label htmlFor="isGlobalEdit" className="text-sm font-medium text-gray-700 cursor-pointer">Global Notification</label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Are you sure?</h2>
                            <p className="text-gray-500 mb-8">This action cannot be undone. This notification will be permanently deleted.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Delete Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManagement;
