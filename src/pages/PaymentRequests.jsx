import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Loader2, User, Clock, Wallet } from 'lucide-react';
import { fetchWithdrawals, approveWithdrawalRequest, rejectWithdrawalRequest } from '../store/slices/withdrawalSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function PaymentRequests() {
    const dispatch = useDispatch();
    const { items, isLoading, isProcessing } = useSelector((state) => state.withdrawals);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

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
        dispatch(approveWithdrawalRequest(selectedRequest._id)).then((action) => {
            if (action.meta.requestStatus === 'fulfilled') {
                setIsModalOpen(false);
                setSelectedRequest(null);
            }
        });
    };

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
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
                <p className="text-gray-600 mt-2">Review and process user withdrawal requests</p>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Fetching withdrawals...</p>
                </div>
            ) : (
                <Table
                    columns={columns}
                    data={items}
                    onRowAction={handleViewDetails}
                />
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
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {showRejectInput ? 'Confirm Rejection' : 'Reject Withdrawal'}
                                </button>
                                {!showRejectInput && (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Approve Withdrawal'
                                        )}
                                    </button>
                                )}
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
