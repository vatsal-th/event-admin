import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { Eye, Loader2, User, Clock, Wallet, CheckCircle2, XCircle, Search, Filter, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Pagination from '../components/Pagination';
import FilterDropdown from '../components/FilterDropdown';
import { fetchWithdrawals, approveWithdrawalRequest, rejectWithdrawalRequest } from '../store/slices/withdrawalSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

export default function PaymentRequests() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const { items, isLoading, isProcessing } = useSelector((state) => state.withdrawals);

    const canManageWithdrawals = useMemo(() => {
        if (!user) return false;
        return user.role?.toLowerCase() === 'admin' || user.permissions?.includes('withdrawal_manage');
    }, [user]);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchWithdrawals());
    }, [dispatch]);

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
        setShowRejectInput(false);
        setRejectReason('');
    };

    const handleReject = () => {
        if (!canManageWithdrawals) {
            toast.error('You do not have permission to reject withdrawals');
            return;
        }
        if (!showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        dispatch(rejectWithdrawalRequest({
            id: selectedRequest._id,
            reason: rejectReason.trim()
        })).then((action) => {
            if (action.meta.requestStatus === 'fulfilled') {
                setIsModalOpen(false);
                setSelectedRequest(null);
                setShowRejectInput(false);
                setRejectReason('');
            }
        });
    };

    const handleApprove = () => {
        if (!canManageWithdrawals) {
            toast.error('You do not have permission to approve withdrawals');
            return;
        }
        dispatch(approveWithdrawalRequest(selectedRequest._id)).then((action) => {
            if (action.meta.requestStatus === 'fulfilled') {
                setIsModalOpen(false);
                setSelectedRequest(null);
            }
        });
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const fullName = (item.userId?.fullName || '').toLowerCase();
            const id = (item.userId?._id || '').toLowerCase();
            const matchesSearch = fullName.includes(searchLower) || id.includes(searchLower);

            // Status filter
            const matchesStatus = statusFilter === 'all' || item.status?.toLowerCase() === statusFilter.toLowerCase();

            // Date range filter
            let matchesDate = true;
            if (startDate || endDate) {
                const itemDate = new Date(item.createdAt);
                itemDate.setHours(0, 0, 0, 0);

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (itemDate < start) matchesDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(0, 0, 0, 0);
                    if (itemDate > end) matchesDate = false;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [items, searchTerm, statusFilter, startDate, endDate]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, startDate, endDate]);

    const columns = [
        {
            header: 'User',
            accessor: 'userId',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.userId?.fullName || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">ID: {row.userId?._id?.substring(0, 8)}...</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'amount',
            render: (row) => (
                <div className="font-semibold text-gray-900 flex items-center gap-1">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    ₹{row.amount.toLocaleString()}
                </div>
            )
        },
        {
            header: 'Requested On',
            accessor: 'createdAt',
            render: (row) => {
                const date = new Date(row.createdAt || row.requestDate || Date.now());
                return (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                            {date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <Badge status={row.status} />
        },
        {
            header: 'Action',
            render: (row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(row);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                    <Eye className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
                    <p className="text-gray-600 mt-2">Review and process user withdrawal requests</p>
                </div>
                <button
                    onClick={() => navigate('/payment-requests/history')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700 font-medium cursor-pointer"
                >
                    <Clock className="w-5 h-5 text-gray-500" />
                    History
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by user name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-hidden text-sm"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4">
                        <FilterDropdown
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' }
                            ]}
                        />

                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                            <Calendar size={16} className="text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-0 p-1 text-xs font-medium text-gray-700 outline-hidden focus:ring-0"
                            />
                            <span className="text-gray-300">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-0 p-1 text-xs font-medium text-gray-700 outline-hidden focus:ring-0"
                            />
                            {(startDate || endDate) && (
                                <button 
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="ml-1 text-gray-400 hover:text-red-500"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="text-gray-500">
                        Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> requests
                    </div>
                    {(searchTerm || statusFilter !== 'all' || startDate || endDate) && (
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Fetching withdrawals...</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table
                        columns={columns}
                        data={paginatedItems}
                        onRowAction={handleViewDetails}
                    />
                    
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredItems.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Withdrawal Detail Modal */}
            {selectedRequest && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRequest(null);
                        setShowRejectInput(false);
                        setRejectReason('');
                    }}
                    title="Withdrawal Details"
                    size="md"
                >
                    <div className="space-y-6">
                        {/* User Summary */}
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {selectedRequest.userId?.fullName}
                                </h3>
                                <p className="text-sm text-gray-500">Points available: {selectedRequest.userId?.points || 0}</p>
                                <div className="mt-2">
                                    <Badge status={selectedRequest.status} />
                                </div>
                            </div>
                        </div>

                        {/* Amount Card */}
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Withdrawal Amount</p>
                            <p className="text-4xl font-black text-gray-900">₹{selectedRequest.amount.toLocaleString()}</p>
                        </div>

                        {/* Bank Details section could be added here if needed, 
                            but usually it's tied to the user's verified bank account */}

                        {/* Reject Reason Input */}
                        {showRejectInput && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Rejection Reason
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Explain why this withdrawal is being rejected..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
                                    rows="3"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Actions */}
                        {selectedRequest.status === 'pending' && (
                            <div className="flex flex-col gap-3 pt-4">
                                {!canManageWithdrawals && (
                                    <p className="text-sm font-bold text-amber-600 flex items-center gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                        <Clock size={18} /> You do not have permission to process this withdrawal.
                                    </p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleReject}
                                        disabled={isProcessing || !canManageWithdrawals}
                                        className="flex-1 px-6 py-3.5 bg-red-50 text-red-700 rounded-2xl hover:bg-red-100 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-not-allowed border border-red-100"
                                    >
                                        <XCircle size={20} />
                                        {showRejectInput ? 'Confirm Rejection' : 'Reject Withdrawal'}
                                    </button>
                                    {!showRejectInput && (
                                        <button
                                            onClick={handleApprove}
                                            disabled={isProcessing || !canManageWithdrawals}
                                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:shadow-lg hover:shadow-emerald-200 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-not-allowed"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} />
                                                    Approve Withdrawal
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-xs font-bold text-red-700 uppercase mb-1">Rejection Reason</p>
                                <p className="text-sm text-red-900">{selectedRequest.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
