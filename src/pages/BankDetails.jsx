import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, CheckCircle2, XCircle, Loader2, Landmark, User, CreditCard, Globe, Tag } from 'lucide-react';
import { fetchBankDetails, verifyBankStatus } from '../store/slices/bankDetailSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function BankDetails() {
    const dispatch = useDispatch();
    const { items, isLoading, isProcessing } = useSelector((state) => state.bankDetails);

    const [selectedBank, setSelectedBank] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        dispatch(fetchBankDetails());
    }, [dispatch]);

    const handleViewDetails = (bank) => {
        setSelectedBank(bank);
        setIsModalOpen(true);
        setShowRejectInput(false);
        setRejectReason('');
    };

    const handleVerifyBank = (status) => {
        if (status === 'rejected') {
            if (!showRejectInput) {
                setShowRejectInput(true);
                return;
            }
            if (!rejectReason.trim()) {
                toast.error('Please provide a reason for rejection');
                return;
            }
        }

        dispatch(verifyBankStatus({
            id: selectedBank._id,
            status: status,
            reason: status === 'rejected' ? rejectReason.trim() : ''
        })).then((action) => {
            if (action.meta.requestStatus === 'fulfilled') {
                setIsModalOpen(false);
                setSelectedBank(null);
                setShowRejectInput(false);
                setRejectReason('');
            }
        });
    };

    const columns = [
        {
            header: 'User',
            accessor: 'userId',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.userId?.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">ID: {row.userId?._id?.substring(0, 8)}...</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Bank Name',
            accessor: 'bankName',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-gray-400" />
                    <span className="font-medium uppercase">{row.bankName}</span>
                </div>
            )
        },
        {
            header: 'Account Info',
            accessor: 'accountNumber',
            render: (row) => (
                <div>
                    <p className="font-mono text-sm">{row.accountNumber}</p>
                    <p className="text-xs text-gray-500 uppercase">IFSC: {row.ifscCode}</p>
                </div>
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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bank Verification</h1>
                    <p className="text-gray-600 mt-1">Review and verify user bank account details</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm self-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    {items.length} Total Requests
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading bank details...</p>
                </div>
            ) : (
                <Table
                    columns={columns}
                    data={items}
                    onRowAction={handleViewDetails}
                />
            )}

            {/* Bank Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedBank(null);
                    setShowRejectInput(false);
                    setRejectReason('');
                }}
                title="Bank Account Details"
                size="md"
            >
                {selectedBank && (
                    <div className="space-y-6">
                        {/* Status Header */}
                        <div className={`p-4 rounded-xl flex items-center justify-between ${selectedBank.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            selectedBank.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            <div className="flex items-center gap-2 font-medium capitalize">
                                {selectedBank.status === 'pending' && <Loader2 className="w-5 h-5 animate-spin" />}
                                {selectedBank.status === 'approved' && <CheckCircle2 className="w-5 h-5" />}
                                {selectedBank.status === 'rejected' && <XCircle className="w-5 h-5" />}
                                Status: {selectedBank.status}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Holder Name</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium text-gray-900">{selectedBank.accountHolderName || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Bank Name</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <Landmark className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium text-gray-900 uppercase">{selectedBank.bankName}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Number</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <p className="font-mono font-medium text-gray-900">{selectedBank.accountNumber}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">IFSC Code</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <Landmark className="w-4 h-4 text-gray-400" />
                                    <p className="font-mono font-medium text-gray-900">{selectedBank.ifscCode}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Branch</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium text-gray-900 uppercase">{selectedBank.branch || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Type</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <Tag className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium text-gray-900 uppercase">{selectedBank.accountType || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rejection Reason Input */}
                        {showRejectInput && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a reason why this account is being rejected..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none transition-all"
                                    rows="3"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Actions */}
                        {selectedBank.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={() => handleVerifyBank('rejected')}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <XCircle className="w-5 h-5" />
                                    {showRejectInput ? 'Confirm Rejection' : 'Reject Account'}
                                </button>
                                {!showRejectInput && (
                                    <button
                                        onClick={() => handleVerifyBank('approved')}
                                        disabled={isProcessing}
                                        className="flex-1 px-6 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Approve Account
                                            </>
                                        )}
                                    </button>
                                )}
                                {showRejectInput && (
                                    <button
                                        onClick={() => setShowRejectInput(false)}
                                        className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-semibold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
