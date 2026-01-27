import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { mockPaymentRequests } from '../data/mockData';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function PaymentRequests() {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

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

        const reason = rejectReason.trim() || 'No reason provided';
        console.log('Payment rejected:', reason);
        toast.error(`Payment request rejected. Reason: ${reason}`, {
            duration: 4000
        });
        setIsModalOpen(false);
        setSelectedRequest(null);
        setShowRejectInput(false);
        setRejectReason('');
    };

    const handleApprove = async () => {
        setIsProcessing(true);

        // Simulate API call with 2 second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        toast.success(`Payment of ₹${selectedRequest.amount.toLocaleString()} approved and processed!`, {
            duration: 4000,
            icon: '💰'
        });
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const columns = [
        {
            header: 'User Name',
            accessor: 'userName',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <img
                        src={row.avatar}
                        alt={row.userName}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{row.userName}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Request Date',
            accessor: 'requestDate',
            render: (row) => {
                const date = new Date(row.requestDate);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        },
        {
            header: 'Amount Requested',
            accessor: 'amount',
            render: (row) => (
                <span className="font-semibold text-gray-900">
                    ₹{row.amount.toLocaleString()}
                </span>
            )
        },
        {
            header: 'Payment Method',
            accessor: 'paymentMethod',
            render: (row) => (
                <span className="text-sm text-gray-700">{row.paymentMethod}</span>
            )
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
                    onClick={() => handleViewDetails(row)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                    <Eye className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payment Requests</h1>
                <p className="text-gray-600 mt-2">Review and process user payment requests</p>
            </div>

            {/* Table */}
            <Table columns={columns} data={mockPaymentRequests} />

            {/* Payment Detail Modal */}
            {selectedRequest && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRequest(null);
                        setShowRejectInput(false);
                        setRejectReason('');
                    }}
                    title="Payment Request Details"
                    size="lg"
                >
                    <div className="space-y-6">
                        {/* User Info */}
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                            <img
                                src={selectedRequest.avatar}
                                alt={selectedRequest.userName}
                                className="w-16 h-16 rounded-full"
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedRequest.userName}
                                </h3>
                                <p className="text-sm text-gray-600">{selectedRequest.email}</p>
                                <div className="mt-2">
                                    <Badge status={selectedRequest.status} />
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Request Date</p>
                                <p className="text-base text-gray-900 mt-1">
                                    {new Date(selectedRequest.requestDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Amount</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    ₹{selectedRequest.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Payment Method Details */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h4 className="font-semibold text-gray-900">Payment Method: {selectedRequest.paymentMethod}</h4>

                            {selectedRequest.paymentMethod === 'UPI' ? (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">UPI ID</p>
                                    <p className="text-base text-gray-900 mt-1 font-mono">
                                        {selectedRequest.paymentDetails.upiId}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Account Holder</p>
                                        <p className="text-base text-gray-900 mt-1">
                                            {selectedRequest.paymentDetails.accountHolder}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                                        <p className="text-base text-gray-900 mt-1 font-mono">
                                            {selectedRequest.paymentDetails.accountNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                                        <p className="text-base text-gray-900 mt-1 font-mono">
                                            {selectedRequest.paymentDetails.ifscCode}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Reject Reason Input */}
                        {showRejectInput && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason (Optional)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                />
                            </div>
                        )}

                        {/* Actions */}
                        {selectedRequest.status === 'pending' && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {showRejectInput ? 'Confirm Rejection' : 'Reject Payment'}
                                </button>
                                {!showRejectInput && (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Approve Payment'
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
