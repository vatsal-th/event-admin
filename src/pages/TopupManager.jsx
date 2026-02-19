import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Eye, 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    User, 
    Calendar, 
    IndianRupee, 
    Target, 
    LayoutGrid, 
    Fingerprint,
    Zap,
    RefreshCw,
    AlertCircle,
    ExternalLink,
    Image as ImageIcon,
    CreditCard as WalletIcon,
    Search,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    Info
} from 'lucide-react';
import { selectUser } from '../store/slices/authSlice';
import { fetchAllTopups, updateTopupStatusAction, fetchAdminProfile, clearError } from '../store/slices/topupSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import FilterDropdown from '../components/FilterDropdown';
import toast from 'react-hot-toast';

export default function TopupManager() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const { items, adminProfile, loading, processing, error } = useSelector((state) => state.topups);

    const canApproveTopup = useMemo(() => {
        if (!user) return false;
        return user.role?.toLowerCase() === 'admin' || user.permissions?.includes('topup_approval');
    }, [user]);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [walletTypeFilter, setWalletTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchAllTopups());
        dispatch(fetchAdminProfile());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                item.userId?.fullName?.toLowerCase().includes(searchLower) ||
                item.userId?._id?.toLowerCase().includes(searchLower) ||
                item.targetName?.toLowerCase().includes(searchLower) ||
                item.targetUserId?.toLowerCase().includes(searchLower) ||
                item.utrNumber?.toLowerCase().includes(searchLower);

            // Wallet Type filter
            const matchesWallet = walletTypeFilter === 'all' || item.walletType === walletTypeFilter;

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

            return matchesSearch && matchesWallet && matchesStatus && matchesDate;
        });
    }, [items, searchTerm, walletTypeFilter, statusFilter, startDate, endDate]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, walletTypeFilter, startDate, endDate]);

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (id, status) => {
        if (!canApproveTopup) {
            toast.error('You do not have permission to approve/reject top-ups');
            return;
        }
        setIsProcessing(true);
        try {
            await dispatch(updateTopupStatusAction({ id, status })).unwrap();
            toast.success(`Request ${status} successfully`);
            dispatch(fetchAdminProfile());
            setIsModalOpen(false);
            setSelectedRequest(null);
        } catch (err) {
            // Error handled by useEffect
        } finally {
            setIsProcessing(false);
        }
    };

    const columns = [
        {
            header: 'Agent Details',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {row.userId?.fullName?.charAt(0) || <User className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.userId?.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">ID: {row.userId?._id?.substring(0, 8)}...</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Application',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{row.appId?.appName || 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Target User',
            render: (row) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                        <Target className="w-3.5 h-3.5 text-blue-500" />
                        {row.targetName || 'N/A'}
                    </div>
                    <span className="text-xs text-gray-500">UID: {row.targetUserId || 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Amount',
            render: (row) => (
                <div className="flex items-center gap-1 font-bold text-gray-900">
                    <IndianRupee size={14} className="text-gray-400" />
                    {row.amount?.toLocaleString()}
                </div>
            )
        },
        {
            header: 'Date',
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                </div>
            )
        },
        {
            header: 'Payment Details',
            render: (row) => (
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        <WalletIcon size={14} className="text-gray-400" /> {row.walletType || 'Cash'}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">UTR: {row.utrNumber || 'N/A'}</p>
                </div>
            )
        },
        {
            header: 'Proof',
            render: (row) => row.paymentProof ? (
                <a 
                    href={row.paymentProof} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                >
                    <img src={row.paymentProof} alt="Proof" className="w-full h-full object-cover" />
                </a>
            ) : (
                <span className="text-xs text-gray-400 font-medium italic">No Proof</span>
            )
        },
        {
            header: 'Status',
            render: (row) => <Badge status={row.status.toLowerCase()} />
        },
        {
            header: 'Action',
            render: (row) => (
                <button
                    onClick={() => handleViewDetails(row)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                    <Eye className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Top-Up Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and manage agent top-up applications</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or UTR..."
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
                        <div className="relative min-w-[140px]">
                            <select
                                value={walletTypeFilter}
                                onChange={(e) => setWalletTypeFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 transition-all outline-hidden text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                <option value="all">All Wallets</option>
                                <option value="Cash">Cash</option>
                                <option value="Online">Online</option>
                                <option value="Other">Other</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>

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
                        Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> of {items.length} requests
                    </div>
                    {(searchTerm || walletTypeFilter !== 'all' || statusFilter !== 'all' || startDate || endDate) && (
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setWalletTypeFilter('all');
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

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <Table 
                    columns={columns}
                    data={paginatedItems}
                    isLoading={loading}
                    emptyMessage="No top-up requests found matching your filters"
                />
                
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {selectedRequest && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRequest(null);
                    }}
                    title="Request Details"
                    size="lg"
                >
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100">
                                {selectedRequest.userId?.fullName?.charAt(0) || <Zap size={32} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900">{selectedRequest.userId?.fullName || 'N/A'}</h3>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <Badge status={selectedRequest.status.toLowerCase()} />
                                    <span className="text-sm text-gray-500 font-medium">Agent ID: {selectedRequest.userId?._id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Request Info</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 flex items-center gap-2"><LayoutGrid size={16} /> App Name</span>
                                        <span className="text-sm font-bold text-gray-900">{selectedRequest.appId?.appName || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 flex items-center gap-2"><IndianRupee size={16} /> Amount</span>
                                        <span className="text-sm font-bold text-blue-600">₹{selectedRequest.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={16} /> Date</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target User</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Target size={16} /> Name</span>
                                        <span className="text-sm font-bold text-gray-900">{selectedRequest.targetName || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Fingerprint size={16} /> ID</span>
                                        <span className="text-sm font-bold text-gray-900">{selectedRequest.targetUserId || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Transaction Details</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 flex items-center gap-2"><WalletIcon size={16} /> Wallet Type</span>
                                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900">{selectedRequest.walletType || 'Cash'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 flex items-center gap-2"><Fingerprint size={16} /> UTR Number</span>
                                        <span className="text-sm font-mono font-bold text-gray-900 select-all">{selectedRequest.utrNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Proof</p>
                                {selectedRequest.paymentProof ? (
                                    <div className="relative group">
                                        <img 
                                            src={selectedRequest.paymentProof} 
                                            alt="Payment Proof" 
                                            className="w-full h-32 object-cover rounded-xl border border-gray-200"
                                        />
                                        <a 
                                            href={selectedRequest.paymentProof} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white font-bold gap-2 no-underline"
                                        >
                                            <ExternalLink size={18} /> View Full
                                        </a>
                                    </div>
                                ) : (
                                    <div className="h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                        <AlertCircle size={24} className="mb-2" />
                                        <p className="text-xs font-medium">No proof uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedRequest.status.toLowerCase() === 'pending' && (
                            <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
                                {!canApproveTopup && (
                                    <p className="text-sm font-bold text-amber-600 flex items-center gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                        <Info className="w-5 h-5" /> You do not have permission to approve/reject this request.
                                    </p>
                                )}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Rejected')}
                                        disabled={isProcessing || !canApproveTopup}
                                        className="flex-1 px-6 py-3.5 bg-red-50 text-red-700 rounded-2xl hover:bg-red-100 transition-all font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle size={20} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Approved')}
                                        disabled={isProcessing || !canApproveTopup}
                                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-lg transition-all font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />} Approve
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
