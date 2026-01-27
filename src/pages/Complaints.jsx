import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Clock,
    MessageSquare,
    User,
    Loader2,
    X,
} from 'lucide-react';
import { fetchComplaints, resolveComplaintAction, clearError } from '../store/slices/complaintSlice';
import toast from 'react-hot-toast';

const Complaints = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { complaints, loading, error } = useSelector((state) => state.complaints);
    const [open, setOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchComplaints());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const filteredComplaints = useMemo(() => {
        return complaints.filter((c) => {
            const matchesSearch =
                (c.userId?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.email || c.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.complaintNo || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || c.status?.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [complaints, searchQuery, statusFilter]);

    const stats = useMemo(() => ({
        total: complaints.length,
        pending: complaints.filter(c => c.status?.toLowerCase() !== 'resolved').length,
        resolved: complaints.filter(c => c.status?.toLowerCase() === 'resolved').length
    }), [complaints]);

    const handleOpen = (complaint) => {
        setSelectedComplaint(complaint);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedComplaint(null);
        setResolutionNote('');
    };

    const handleResolve = async () => {
        if (!resolutionNote.trim()) {
            toast.error('Please enter a resolution note');
            return;
        }
        try {
            await dispatch(resolveComplaintAction({ id: selectedComplaint._id, resolutionNote })).unwrap();
            toast.success('Complaint resolved successfully');
            handleClose();
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === 'resolved') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold">
                    <CheckCircle2 size={14} />
                    Resolved
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                <Clock size={14} />
                {status || 'Pending'}
            </span>
        );
    };

    const StatCard = ({ title, count, icon: Icon, gradient }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {loading && complaints.length === 0 ? (
                            <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                        ) : (
                            count
                        )}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
                        <p className="text-gray-600 mt-1">Review and resolve user-submitted issues</p>
                    </div>
                    <button
                        onClick={() => dispatch(fetchComplaints())}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Refreshing...' : 'Refresh List'}
                    </button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <StatCard title="Total Tickets" count={stats.total} icon={MessageSquare} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
                    <StatCard title="Pending Review" count={stats.pending} icon={AlertCircle} gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
                    <StatCard title="Resolved Issues" count={stats.resolved} icon={CheckCircle2} gradient="bg-gradient-to-br from-green-500 to-green-600" />
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by user, title or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            {['all', 'pending', 'resolved'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold capitalize transition-all cursor-pointer ${statusFilter === status
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Complaints List */}
                {loading && complaints.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                        <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-xl font-semibold text-gray-600">No complaints found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-700 uppercase tracking-wide">
                            <div className="col-span-3">User</div>
                            <div className="col-span-4">Complaint</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1">Date</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100">
                            {filteredComplaints.map((c) => (
                                <div
                                    key={c._id}
                                    onClick={() => navigate(`/complaints/${c._id}`)}
                                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                        {/* User Info */}
                                        <div className="lg:col-span-3 flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                {c.userId?.fullName?.[0] || <User size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{c.userId?.fullName || 'Unknown User'}</p>
                                                <p className="text-sm text-gray-600 truncate">{c.email || c.userId?.email}</p>
                                            </div>
                                        </div>

                                        {/* Complaint Details */}
                                        <div className="lg:col-span-4 flex items-start gap-3">
                                            {c.photos?.[0] && (
                                                <img
                                                    src={c.photos[0]}
                                                    alt="Complaint"
                                                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 mb-1 truncate">{c.title}</h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                                        {c.type}
                                                    </span>
                                                    <span className="text-xs font-bold text-blue-600">
                                                        {c.complaintNo}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="lg:col-span-2">
                                            {getStatusBadge(c.status)}
                                        </div>

                                        {/* Date */}
                                        <div className="lg:col-span-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="lg:col-span-2 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => navigate(`/complaints/${c._id}`)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                View
                                            </button>
                                            {c.status?.toLowerCase() !== 'resolved' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpen(c);
                                                    }}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Resolve Dialog */}
            {open && selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <AlertCircle size={24} className="text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Resolve Issue</h2>
                                <p className="text-sm text-gray-600">COMPLAINT #{selectedComplaint?.complaintNo}</p>
                            </div>
                        </div>

                        {/* Complaint Preview */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{selectedComplaint?.type}</p>
                            <h3 className="font-bold text-gray-900 mb-2">{selectedComplaint?.title}</h3>
                            <p className="text-sm text-gray-600 italic">"{selectedComplaint?.description}"</p>
                            {selectedComplaint?.photos?.[0] && (
                                <div className="flex gap-2 mt-3">
                                    {selectedComplaint.photos.map((p, i) => (
                                        <img
                                            key={i}
                                            src={p}
                                            alt={`Photo ${i + 1}`}
                                            onClick={() => window.open(p, '_blank')}
                                            className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-75 transition-opacity"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resolution Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                How was this resolved?
                            </label>
                            <textarea
                                autoFocus
                                rows={5}
                                placeholder="Type resolution notes for the user..."
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={loading || !resolutionNote.trim()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Resolving...
                                    </>
                                ) : (
                                    'Close Ticket'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Complaints;
