import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Clock, Wallet, Filter, CheckCircle2, XCircle, ArrowLeft, Search, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchWithdrawalHistory } from '../store/slices/withdrawalSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import FilterDropdown from '../components/FilterDropdown';
import toast from 'react-hot-toast';

export default function WithdrawalHistory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { historyItems, isLoading } = useSelector((state) => state.withdrawals);

    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const status = statusFilter === 'all' ? undefined : statusFilter;
        dispatch(fetchWithdrawalHistory(status));
    }, [dispatch, statusFilter]);

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const filteredItems = useMemo(() => {
        return historyItems.filter(item => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const fullName = (item.userId?.fullName || '').toLowerCase();
            const id = (item.userId?._id || '').toLowerCase();
            const matchesSearch = fullName.includes(searchLower) || id.includes(searchLower);

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

            return matchesSearch && matchesDate;
        });
    }, [historyItems, searchTerm, startDate, endDate]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate, statusFilter]);

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

                {/* Status Filter Dropdown */}
                <FilterDropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { value: 'all', label: 'All History' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' }
                    ]}
                />
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading history...</p>
                </div>
            ) : (
                <>

                {/* Filters Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
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
                            Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> records
                        </div>
                        {(searchTerm || startDate || endDate) && (
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {paginatedItems.length > 0 ? (
                        <>
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
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <Filter className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No records found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
                </>
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
