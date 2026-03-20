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
    PlusCircle,
    Eye,
    Download,
    Calendar,
    Clock,
    UserCheck,
    Globe,
    CreditCard
} from 'lucide-react';
import { 
    fetchAllUsers, 
    toggleFreezeWalletAction, 
    adjustBalanceAction, 
    toggleUserStatusAction,
    clearAdminUserError 
} from '../store/slices/adminUserSlice';
import { adminUserApi } from '../api/adminUserApi';
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

    // Filter States
    const [statusFilter, setStatusFilter] = useState('all');
    const [pointsFilter, setPointsFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Modal States
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [isFetchingUser, setIsFetchingUser] = useState(false);

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
        let result = [...users];

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user => 
                user.fullName?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user._id?.includes(term)
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            const isFrozen = statusFilter === 'frozen';
            result = result.filter(user => user.isWalletFrozen === isFrozen);
        }

        // Points Filter
        if (pointsFilter !== 'all') {
            if (pointsFilter === 'has_points') {
                result = result.filter(user => (user.points || 0) > 0);
            } else if (pointsFilter === 'zero_points') {
                result = result.filter(user => (user.points || 0) === 0);
            }
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'points_high') return (b.points || 0) - (a.points || 0);
            if (sortBy === 'points_low') return (a.points || 0) - (b.points || 0);
            return 0;
        });

        return result;
    }, [users, searchTerm, statusFilter, pointsFilter, sortBy]);

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
    const handleToggleStatus = async (user) => {
        try {
            const newStatus = !user.isActive;
            await dispatch(toggleUserStatusAction({
                userId: user._id,
                isActive: newStatus
            })).unwrap();
            toast.success(`User ${newStatus ? 'Activated' : 'Deactivated'} successfully`);
        } catch (err) {
            // Error handled by useEffect
        }
    };
    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
        setIsFetchingUser(true);
        try {
            const response = await adminUserApi.getUserById(user._id);
            if (response.success) {
                setViewingUser(response.data);
            } else {
                toast.error(response.message || 'Failed to fetch user details');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsFetchingUser(false);
        }
    };

    const handleExportUser = (userData) => {
        if (!userData) return;
        
        const headers = [
            "User ID", "Full Name", "Email", "Gender", "Role", "Points", "Invite ID", 
            "Wallet Frozen", "Account Active", "Created At", "Updated At", 
            "Last Notification View", "Last Service View", "Last System View"
        ];

        const row = [
            userData._id,
            userData.fullName,
            userData.email,
            userData.gender || "N/A",
            userData.role,
            userData.points || 0,
            userData.inviteId || "N/A",
            userData.isWalletFrozen ? "Yes" : "No",
            userData.isActive ? "Yes" : "No",
            userData.createdAt ? new Date(userData.createdAt).toLocaleString() : "N/A",
            userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : "N/A",
            userData.lastNotificationViewedAt ? new Date(userData.lastNotificationViewedAt).toLocaleString() : "Never",
            userData.lastServiceViewedAt ? new Date(userData.lastServiceViewedAt).toLocaleString() : "Never",
            userData.lastSystemViewedAt ? new Date(userData.lastSystemViewedAt).toLocaleString() : "Never"
        ];

        // Escape values and join with commas
        const csvContent = [
            headers.join(","),
            row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user_${userData.fullName.replace(/\s+/g, '_')}_details.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('User details exported as CSV successfully');
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
                    <button
                        onClick={() => handleViewUser(row)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer group relative"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        },
        {
            header: 'Acc Status',
            render: (row) => (
                <div className="flex items-center justify-start">
                    <button
                        onClick={() => handleToggleStatus(row)}
                        disabled={processing}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                            row.status === 'Active' || row.isActive ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                row.status === 'Active' || row.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-gray-500">Monitor users, freeze accounts and adjust balances</p>
                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                        <p className="text-sm font-bold text-blue-600">
                             {filteredUsers.length} of {users.length} Users
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users by name, email or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-sm text-gray-700 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="frozen">Frozen Only</option>
                        </select>

                        {/* Points Filter */}
                        <select
                            value={pointsFilter}
                            onChange={(e) => setPointsFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-sm text-gray-700 cursor-pointer"
                        >
                            <option value="all">All Points</option>
                            <option value="has_points">With Balance</option>
                            <option value="zero_points">Zero Balance</option>
                        </select>

                        {/* Sorting */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-sm text-gray-700 cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="points_high">Highest Points</option>
                            <option value="points_low">Lowest Points</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100">
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

            {/* User Detail Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingUser(null);
                }}
                title="User Detailed Information"
                size="lg"
            >
                <div className="space-y-6">
                    {isFetchingUser ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <p className="text-gray-500 font-bold">Fetching user details...</p>
                        </div>
                    ) : viewingUser ? (
                        <>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                        {viewingUser.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{viewingUser.fullName}</h3>
                                        <p className="text-gray-500 font-medium">{viewingUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleExportUser(viewingUser)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg cursor-pointer"
                                >
                                    <Download size={18} />
                                    Export CSV
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} /> Basic Information
                                    </h4>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 font-medium">User ID</span>
                                            <span className="text-sm font-bold text-gray-900 font-mono">{viewingUser._id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 font-medium">Invite ID</span>
                                            <span className="text-sm font-bold text-gray-900">{viewingUser.inviteId || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 font-medium">Gender</span>
                                            <span className="text-sm font-bold text-gray-900 capitalize">{viewingUser.gender || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 font-medium">Role</span>
                                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">{viewingUser.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Status */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Settings2 size={14} /> Account Status
                                    </h4>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 font-medium">Account Status</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                viewingUser.isActive 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {viewingUser.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 font-medium">Wallet Status</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                viewingUser.isWalletFrozen 
                                                ? 'bg-red-50 text-red-700 border-red-100' 
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>
                                                {viewingUser.isWalletFrozen ? 'Frozen' : 'Normal'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 font-medium">Wallet Balance</span>
                                            <div className="flex items-center gap-1.5 font-black text-gray-900">
                                                <Zap size={14} className="text-amber-500 fill-amber-500" />
                                                {viewingUser.points?.toLocaleString() || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Logs */}
                                <div className="space-y-4 md:col-span-2">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={14} /> Activity & System Timestamps
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 font-medium flex items-center gap-2"><Eye size={12}/> Last Notification View</span>
                                                <span className="text-sm font-bold text-gray-900">{viewingUser.lastNotificationViewedAt ? new Date(viewingUser.lastNotificationViewedAt).toLocaleString() : 'Never'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 font-medium flex items-center gap-2"><Eye size={12}/> Last Service View</span>
                                                <span className="text-sm font-bold text-gray-900">{viewingUser.lastServiceViewedAt ? new Date(viewingUser.lastServiceViewedAt).toLocaleString() : 'Never'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 font-medium flex items-center gap-2"><Eye size={12}/> Last System View</span>
                                                <span className="text-sm font-bold text-gray-900">{viewingUser.lastSystemViewedAt ? new Date(viewingUser.lastSystemViewedAt).toLocaleString() : 'Never'}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 font-medium flex items-center gap-2"><Calendar size={12}/> Created On</span>
                                                <span className="text-sm font-bold text-gray-900">{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 font-medium flex items-center gap-2"><RefreshCw size={12}/> Last Updated</span>
                                                <span className="text-sm font-bold text-gray-900">{viewingUser.updatedAt ? new Date(viewingUser.updatedAt).toLocaleString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-red-500 font-bold">Error loading user details.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
