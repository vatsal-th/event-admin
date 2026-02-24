import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Loader2, 
    User, 
    Calendar, 
    IndianRupee, 
    Search,
    Filter,
    X,
    MessageSquare,
    ExternalLink,
    AlertCircle,
    Clock,
    CreditCard,
    ArrowLeft,
    History as HistoryIcon,
    Mail,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllRecharges, clearRechargeError } from '../store/slices/rechargeSlice';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

export default function RechargeHistory() {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector((state) => state.recharges);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchAllRecharges());
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
                item.userId?.email?.toLowerCase().includes(searchLower) ||
                item.userId?._id?.toLowerCase().includes(searchLower) ||
                item.utrNumber?.toLowerCase().includes(searchLower) ||
                item.agentId?.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'all' || item.status?.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [items, searchTerm, statusFilter]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const columns = [
        {
            header: 'User & Contact',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                        {row.userId?.fullName?.charAt(0) || <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{row.userId?.fullName || 'N/A'}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Mail size={10} />
                            <span className="truncate">{row.userId?.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Points/ID',
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-black text-gray-900">{row.userId?.points || 0}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">Agent: {row.agentId || 'N/A'}</p>
                </div>
            )
        },
        {
            header: 'Amount',
            render: (row) => (
                <div className="flex items-center gap-1 font-black text-gray-900">
                    <IndianRupee size={14} className="text-gray-400" />
                    {row.amount?.toLocaleString()}
                </div>
            )
        },
        {
            header: 'Payment Info',
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <CreditCard size={12} className="text-gray-400" />
                        {row.rechargeType || row.paymentMethod?.title || row.paymentMethod || 'Online'}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono select-all">UTR: {row.utrNumber || 'N/A'}</p>
                </div>
            )
        },
        {
            header: 'Status',
            render: (row) => <Badge status={row.status.toLowerCase()} />
        },
        {
            header: 'Date & Time',
            render: (row) => (
                <div className="text-xs text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Calendar size={12} className="text-gray-400" />
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Clock size={12} />
                        {row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link 
                        to="/admin/recharge-requests"
                        className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all hover:shadow-sm cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <HistoryIcon size={24} className="text-gray-900" />
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recharge History</h1>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Audit log of all successful and failed recharges</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Link 
                        to="/admin/recharge-requests"
                        className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        Active Requests
                    </Link>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Name, Email, Agent ID or UTR..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                        {['all', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                    statusFilter === status 
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        className="px-4 py-3 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all border border-gray-200 cursor-pointer"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table 
                        columns={columns}
                        data={paginatedItems}
                        isLoading={loading}
                        emptyMessage="No search results found in history"
                    />
                </div>
                
                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredItems.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}
