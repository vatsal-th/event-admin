import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    User, 
    Calendar, 
    IndianRupee, 
    Zap,
    Search,
    Filter,
    X,
    MessageSquare,
    ExternalLink,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    Info,
    Clock,
    CreditCard,
    History as HistoryIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllRecharges, updateRechargeStatusAction, clearRechargeError } from '../store/slices/rechargeSlice';
import { fetchWalletSummary } from '../store/slices/walletSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

export default function RechargeRequests() {
    const dispatch = useDispatch();
    const { items, loading, processing, error } = useSelector((state) => state.recharges);
    const { summary } = useSelector((state) => state.wallet);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchAllRecharges());
        dispatch(fetchWalletSummary());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearRechargeError());
        }
    }, [error, dispatch]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                item.userId?.fullName?.toLowerCase().includes(searchLower) ||
                item.userId?._id?.toLowerCase().includes(searchLower) ||
                item.utrNumber?.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'all' || item.status?.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [items, searchTerm, statusFilter]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setAdminNote(request.adminNote || '');
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (status) => {
        if (!selectedRequest) return;
        
        try {
            await dispatch(updateRechargeStatusAction({ 
                id: selectedRequest._id, 
                status, 
                adminNote 
            })).unwrap();
            
            toast.success(`Recharge ${status} successfully`);
            dispatch(fetchWalletSummary());
            setIsModalOpen(false);
            setSelectedRequest(null);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const columns = [
        {
            header: 'User Details',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
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
            header: 'Amount',
            render: (row) => (
                <div className="flex items-center gap-1 font-bold text-gray-900 text-lg">
                    <IndianRupee size={16} className="text-gray-400" />
                    {row.amount?.toLocaleString()}
                </div>
            )
        },
        {
            header: 'UTR Number',
            render: (row) => (
                <span className="text-sm font-mono font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    {row.utrNumber || 'N/A'}
                </span>
            )
        },
        {
            header: 'Method',
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard size={14} className="text-gray-400" />
                    {row.paymentMethod?.title || row.paymentMethod || 'Online'}
                </div>
            )
        },
        {
            header: 'Date',
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                </div>
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
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-bold text-xs cursor-pointer"
                >
                    Review
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Wallet Recharge Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage manual recharge requests for the admin wallet</p>
                </div>
                
                <Link 
                    to="/admin/recharge-history"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <HistoryIcon size={20} /> View History
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by User Name or UTR..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected', 'all'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                    statusFilter === status 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <Table 
                    columns={columns}
                    data={paginatedItems}
                    isLoading={loading}
                    emptyMessage="No recharge requests found"
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
                    title="Review Recharge Request"
                    size="lg"
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                {selectedRequest.userId?.fullName?.charAt(0) || <User />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedRequest.userId?.fullName || 'N/A'}</h3>
                                <p className="text-sm text-gray-500 font-medium">Request ID: {selectedRequest._id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Amount to Add</p>
                                <p className="text-2xl font-black text-blue-600">₹{selectedRequest.amount?.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">UTR Number</p>
                                <p className="text-lg font-bold text-gray-900 select-all">{selectedRequest.utrNumber || 'N/A'}</p>
                            </div>
                        </div>

                        {selectedRequest.paymentProof && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Proof</label>
                                <div className="relative group">
                                    <img 
                                        src={selectedRequest.paymentProof} 
                                        alt="Proof" 
                                        className="w-full h-64 object-contain rounded-2xl border border-gray-200 bg-white p-2 text-center"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <a 
                                        href={selectedRequest.paymentProof} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-xl shadow-lg border border-gray-100 hover:bg-white transition-colors text-blue-600 no-underline flex items-center gap-2 font-bold text-sm"
                                    >
                                        <ExternalLink size={16} /> Open Full Image
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Note (Reason for Approve/Reject)</label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Type your notes here..."
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none h-24 resize-none text-sm"
                            />
                        </div>

                        {selectedRequest.status.toLowerCase() === 'pending' ? (
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => handleStatusUpdate('Rejected')}
                                    disabled={processing}
                                    className="flex-1 px-6 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <XCircle size={20} /> Reject Request
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('Approved')}
                                    disabled={processing}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg transition-all font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />} Approve & Add Balance
                                </button>
                            </div>
                        ) : (
                            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                                selectedRequest.status.toLowerCase() === 'approved' 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                                : 'bg-red-50 border-red-100 text-red-800'
                            }`}>
                                <Info size={20} />
                                <p className="text-sm font-bold">This request has already been {selectedRequest.status.toLowerCase()}.</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
