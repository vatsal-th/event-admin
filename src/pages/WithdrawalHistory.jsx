import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, User, Clock, Wallet, Filter, CheckCircle2, XCircle, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWithdrawalHistory } from '../store/slices/withdrawalSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function WithdrawalHistory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { historyItems, isLoading } = useSelector((state) => state.withdrawals);

    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Fetch history when filter changes
        // If filter is 'all', we might want to pass undefined or handle it in the API to fetch all
        // The API definition was getWithdrawalHistory(status). If status is undefined, it fetches all? 
        // Let's assume the API handles it or we pass null/undefined for all.
        const status = statusFilter === 'all' ? undefined : statusFilter;
        dispatch(fetchWithdrawalHistory(status));
    }, [dispatch, statusFilter]);

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'User',
            accessor: 'userId',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {row.userId?.fullName?.charAt(0) || <User className="w-5 h-5" />}
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
                    ₹{row.amount?.toLocaleString()}
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => {
                const date = new Date(row.createdAt || row.requestDate || Date.now());
                return (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                            {date.toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
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
                    <Search className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/payment-requests')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft size={20} /> Back to Requests
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Withdrawal History</h1>
                    <p className="text-gray-600 mt-2">View all past withdrawal requests and their statuses</p>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize cursor-pointer ${statusFilter === status
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading history...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {historyItems.length > 0 ? (
                        <Table
                            columns={columns}
                            data={historyItems}
                            onRowAction={handleViewDetails}
                        />
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <Filter className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No records found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedRequest && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRequest(null);
                    }}
                    title="Withdrawal Details"
                    size="md"
                >
                    <div className="space-y-6">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${selectedRequest.status === 'approved' ? 'bg-green-50 text-green-700' :
                                selectedRequest.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                    'bg-yellow-50 text-yellow-700'
                            }`}>
                            {selectedRequest.status === 'approved' ? <CheckCircle2 size={24} /> :
                                selectedRequest.status === 'rejected' ? <XCircle size={24} /> :
                                    <Clock size={24} />}
                            <div>
                                <p className="font-bold text-lg capitalize">{selectedRequest.status}</p>
                                <p className="text-sm opacity-90">
                                    {selectedRequest.status === 'approved' ? 'Processed successfully' :
                                        selectedRequest.status === 'rejected' ? 'Request was rejected' :
                                            'Pending approval'}
                                </p>
                            </div>
                        </div>

                        {/* User Summary */}
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {selectedRequest.userId?.fullName}
                                </h3>
                                <p className="text-sm text-gray-500">{selectedRequest.userId?.email}</p>
                            </div>
                        </div>

                        {/* Amount Card */}
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Withdrawal Amount</p>
                            <p className="text-4xl font-black text-gray-900">₹{selectedRequest.amount?.toLocaleString()}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 block mb-1">Request Date</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 block mb-1">Request Time</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>

                        {/* Rejection Reason if any */}
                        {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-xs font-bold text-red-700 uppercase mb-1">Rejection Reason</p>
                                <p className="text-sm text-red-900">{selectedRequest.rejectionReason}</p>
                            </div>
                        )}

                        {/* Admin Action Info (if available in data) */}
                        {(selectedRequest.processedBy || selectedRequest.processedAt) && (
                            <div className="text-xs text-center text-gray-400 mt-4">
                                {selectedRequest.processedBy && <span>Processed by Admin • </span>}
                                {selectedRequest.processedAt && <span>{new Date(selectedRequest.processedAt).toLocaleString()}</span>}
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
