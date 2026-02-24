import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Search, 
    User, 
    Mail, 
    Zap, 
    ShieldAlert, 
    ShieldCheck, 
    ArrowUpRight, 
    ArrowDownRight, 
    Loader2, 
    Search as SearchIcon,
    RefreshCw,
    AlertCircle,
    Copy,
    ChevronLeft,
    ChevronRight,
    Settings2,
    Lock,
    Unlock,
    MinusCircle,
    PlusCircle
} from 'lucide-react';
import { 
    fetchAllUsers, 
    toggleFreezeWalletAction, 
    adjustBalanceAction, 
    clearAdminUserError 
} from '../store/slices/adminUserSlice';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

export default function Users() {
    const dispatch = useDispatch();
    const { users, loading, processing, error } = useSelector((state) => state.adminUsers);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal States
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Adjust Balance Form State
    const [adjustData, setAdjustData] = useState({
        amount: '',
        action: 'add',
        reason: ''
    });

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAdminUserError());
        }
    }, [error, dispatch]);

    const filteredUsers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return users.filter(user => 
            user.fullName?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user._id?.includes(term)
        );
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const handleOpenAdjust = (user) => {
        setSelectedUser(user);
        setAdjustData({ amount: '', action: 'add', reason: '' });
        setIsAdjustModalOpen(true);
    };

    const handleOpenFreeze = (user) => {
        setSelectedUser(user);
        setIsFreezeModalOpen(true);
    };

    const handleAdjustSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        try {
            await dispatch(adjustBalanceAction({
                userId: selectedUser._id,
                ...adjustData,
                amount: Number(adjustData.amount)
            })).unwrap();
            toast.success(`Success fully adjusted balance for ${selectedUser.fullName}`);
            setIsAdjustModalOpen(false);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const handleToggleFreeze = async () => {
        if (!selectedUser) return;
        
        try {
            const newStatus = !selectedUser.isWalletFrozen;
            await dispatch(toggleFreezeWalletAction({
                userId: selectedUser._id,
                isWalletFrozen: newStatus
            })).unwrap();
            toast.success(`User wallet ${newStatus ? 'Frozen' : 'Unfrozen'} successfully`);
            setIsFreezeModalOpen(false);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const columns = [
        {
            header: 'User Info',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {row.fullName?.charAt(0) || <User size={20} />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{row.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-500 truncate">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Wallet Points',
            render: (row) => (
                <div className="flex items-center gap-1.5 font-black text-gray-900">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    {row.points?.toLocaleString() || 0}
                </div>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    row.isWalletFrozen 
                    ? 'bg-red-50 text-red-700 border-red-100' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                    {row.isWalletFrozen ? <Lock size={10} /> : <Unlock size={10} />}
                    {row.isWalletFrozen ? 'Frozen' : 'Active'}
                </div>
            )
        },
        {
            header: 'Joined On',
            render: (row) => (
                <p className="text-sm text-gray-600">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                </p>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleOpenAdjust(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group relative"
                        title="Adjust Balance"
                    >
                        <PlusCircle size={18} />
                    </button>
                    <button
                        onClick={() => handleOpenFreeze(row)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            row.isWalletFrozen ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={row.isWalletFrozen ? "Unfreeze Wallet" : "Freeze Wallet"}
                    >
                        {row.isWalletFrozen ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-1">Monitor users, freeze accounts and adjust balances</p>
                </div>
                <button 
                    onClick={() => dispatch(fetchAllUsers())}
                    className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all hover:shadow-sm cursor-pointer"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users by name, email or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <Table 
                    columns={columns}
                    data={paginatedUsers}
                    isLoading={loading}
                    emptyMessage="No users found"
                />
                
                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredUsers.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Adjust Balance Modal */}
            <Modal
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                title="Adjust User Balance"
                size="md"
            >
                <form onSubmit={handleAdjustSubmit} className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {selectedUser?.fullName?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{selectedUser?.fullName}</p>
                            <p className="text-xs text-gray-500">Current Points: {selectedUser?.points}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider cursor-pointer">Action Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setAdjustData({ ...adjustData, action: 'add' })}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                                    adjustData.action === 'add' 
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <PlusCircle size={18} /> Add Points
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustData({ ...adjustData, action: 'cut' })}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                                    adjustData.action === 'cut' 
                                    ? 'bg-red-50 border-red-500 text-red-700' 
                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <MinusCircle size={18} /> Deduct Points
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Amount (Points)</label>
                        <input
                            type="number"
                            value={adjustData.amount}
                            onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value })}
                            placeholder="Ex: 500"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-bold"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Reason for Adjustment</label>
                        <textarea
                            value={adjustData.reason}
                            onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                            placeholder="Reason for this change..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none h-24"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAdjustModalOpen(false)}
                            className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`flex-1 px-4 py-3.5 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                                adjustData.action === 'add' ? 'bg-emerald-600 shadow-emerald-100 transition-all hover:bg-emerald-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'
                            }`}
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <Settings2 size={18} />}
                            Confirm Adjustment
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Freeze Wallet Modal */}
            <Modal
                isOpen={isFreezeModalOpen}
                onClose={() => setIsFreezeModalOpen(false)}
                title={selectedUser?.isWalletFrozen ? "Unfreeze User Wallet" : "Freeze User Wallet"}
                size="sm"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                            selectedUser?.isWalletFrozen ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                            {selectedUser?.isWalletFrozen ? <Unlock size={40} /> : <Lock size={40} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedUser?.isWalletFrozen ? "Unfreeze Wallet?" : "Freeze Wallet?"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2 px-4">
                                {selectedUser?.isWalletFrozen 
                                    ? `Allow ${selectedUser.fullName} to use their wallet points again.` 
                                    : `This will prevent ${selectedUser?.fullName} from spending points or performing wallet transactions.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsFreezeModalOpen(false)}
                            className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleToggleFreeze}
                            disabled={processing}
                            className={`flex-1 px-4 py-3.5 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                                selectedUser?.isWalletFrozen ? 'bg-emerald-600 shadow-emerald-100' : 'bg-red-600 shadow-red-100'
                            }`}
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : (selectedUser?.isWalletFrozen ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />)}
                            {selectedUser?.isWalletFrozen ? "Unfreeze Now" : "Freeze Now"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
