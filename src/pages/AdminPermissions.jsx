import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, Loader2, AlertCircle, CheckCircle2, X, Filter } from 'lucide-react';
import {
    CircularProgress
} from '@mui/material';
import toast from 'react-hot-toast';
import permissionApi from '../api/permissionApi';
import Table from '../components/Table';
import Modal from '../components/Modal';

import Pagination from '../components/Pagination';

const AdminPermissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal States
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
    const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

    useEffect(() => {
        fetchPermissions(currentPage);
    }, [currentPage, statusFilter, startDate, endDate]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page on search or filter change
    }, [searchTerm, statusFilter, startDate, endDate]);

    const fetchPermissions = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await permissionApi.getAdminPermissions(page, recordsPerPage, {
                status: statusFilter,
                startDate,
                endDate
            });
            const result = response.data?.data || response.data || response;
            const data = Array.isArray(result) ? result : (result?.requests || []);
            setPermissions(data);

            // Extract pagination info from response
            const pagination = response.data?.pagination || result?.pagination;
            if (pagination) {
                setTotalRecords(pagination.totalRecords || 0);
            } else {
                setTotalRecords(data.length);
            }
        } catch (err) {
            console.error('Error fetching permissions:', err);
            setError('Failed to load permissions. Please try again.');
            toast.error('Could not load permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus, reason = '') => {
        try {
            setIsUpdating(id);
            await permissionApi.updateAdminPermission(id, newStatus, reason);

            // Update local state
            setPermissions(prev => prev.map(p =>
                (p._id === id || p.id === id) ? { ...p, status: newStatus, rejectionReason: reason } : p
            ));

            toast.success(`Permission ${newStatus} successfully`);
            setConfirmModal({ open: false, id: null });
            setRejectModal({ open: false, id: null, reason: '' });
        } catch (err) {
            console.error('Error updating permission:', err);
            toast.error(err.response?.data?.message || `Failed to ${newStatus.toLowerCase()} permission`);
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredPermissions = permissions.filter(p =>
        p.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'User',
            accessor: 'userId',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {row.userId?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{row.userId?.fullName || 'Invite User'}</p>
                        <p className="text-xs text-gray-500 font-mono">{row.userId?.email || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Service',
            accessor: 'serviceName',
            render: (row) => (
                <span className="capitalize font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                    {row.serviceName}
                </span>
            )
        },
        {
            header: 'Reason',
            render: (row) => (
                <p className="text-sm text-gray-600 max-w-xs line-clamp-2" title={row.text}>
                    {row.text}
                </p>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${row.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : row.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {row.status || 'Pending'}
                    </span>
                    {row.status === 'Rejected' && row.rejectionReason && (
                        <p className="text-[10px] text-red-500 italic max-w-[150px] truncate" title={row.rejectionReason}>
                            Reason: {row.rejectionReason}
                        </p>
                    )}
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => (
                <div className="text-sm text-gray-500">
                    <p>{new Date(row.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {isUpdating === (row._id || row.id) ? (
                        <CircularProgress size={24} />
                    ) : (
                        <div className="flex gap-2">
                            {row.status === 'Pending' ? (
                                <>
                                    <button
                                        onClick={() => setConfirmModal({ open: true, id: row._id || row.id })}
                                        className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all cursor-pointer shadow-sm shadow-green-100"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setRejectModal({ open: true, id: row._id || row.id, reason: '' })}
                                        className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all cursor-pointer shadow-sm shadow-red-100"
                                    >
                                        Reject
                                    </button>
                                </>
                            ) : (
                                <span className={`text-xs italic font-medium px-2 py-1 ${row.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    Already {row.status}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShieldCheck className="text-blue-600 w-8 h-8" />
                        Permission Requests Management
                    </h1>
                    <p className="text-gray-500 mt-2">Review and approve user requests for various services.</p>
                </div>
                <button
                    onClick={fetchPermissions}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Left: Search */}
                        <div className="relative w-full lg:max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 text-base rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm"
                            />
                        </div>

                        {/* Right: Filters */}
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
                            <div className="relative min-w-[160px]">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 text-sm rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all cursor-pointer shadow-sm appearance-none"
                                >
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="flex items-center bg-gray-50/50 border border-gray-100 rounded-xl px-3 shadow-sm focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-500 transition-all">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-2 py-3 text-sm focus:outline-none bg-transparent cursor-pointer text-gray-600 w-36 outline-none"
                                    title="Start Date"
                                />
                                <span className="text-gray-400 font-bold px-2">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-2 py-3 text-sm focus:outline-none bg-transparent cursor-pointer text-gray-600 w-36 outline-none"
                                    title="End Date"
                                />
                            </div>
                            
                            {(statusFilter || startDate || endDate) && (
                                <button
                                    onClick={() => {
                                        setStatusFilter('');
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer bg-red-50/50"
                                    title="Clear All Filters"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 font-medium ml-1">
                        Showing <span className="font-bold text-gray-900">{totalRecords}</span> applications
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-medium text-lg">Loading requests...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Requests</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={fetchPermissions}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredPermissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredPermissions} />
                    </div>
                ) : (
                    <div className="p-20 text-center text-gray-500 italic">
                        No requests found matching your search.
                    </div>
                )}

                {!loading && !error && permissions.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalRecords}
                        itemsPerPage={recordsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Approval Confirmation Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, id: null })}
                title="Confirm Approval"
                size="sm"
            >
                <div className="p-1">
                    <p className="text-gray-600 mb-6">Are you sure you want to approve this permission request? This action will grant the user access to the requested service.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setConfirmModal({ open: false, id: null })}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(confirmModal.id, 'Approved')}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-100 transition-all"
                        >
                            Confirm Approve
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={rejectModal.open}
                onClose={() => setRejectModal({ open: false, id: null, reason: '' })}
                title="Reject Request"
                size="md"
            >
                <div className="p-1">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason for Rejection
                        </label>
                        <textarea
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Please provide a reason for rejecting this request..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
                            required
                        ></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(rejectModal.id, 'Rejected', rejectModal.reason)}
                            disabled={!rejectModal.reason.trim()}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-lg shadow-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reject Request
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminPermissions;
