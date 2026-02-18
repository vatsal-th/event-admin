import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock, RefreshCw, Loader2, IndianRupee, Filter, Search, Zap } from 'lucide-react';
import { fetchWalletSummary, fetchWalletTransactions } from '../store/slices/walletSlice';
import Table from '../components/Table';

export default function AdminWallet() {
    const dispatch = useDispatch();
    const { summary, transactions, isLoading } = useSelector((state) => state.wallet);
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchWalletSummary());
    }, [dispatch]);

    useEffect(() => {
        const type = typeFilter === 'all' ? undefined : typeFilter;
        dispatch(fetchWalletTransactions(type));
    }, [dispatch, typeFilter]);

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return transactions;
        const term = searchTerm.toLowerCase();
        return transactions.filter(tx => {
            const userName = tx.relatedId?.userId?.fullName?.toLowerCase() || 'system';
            const amount = tx.amount?.toString() || '';
            const description = tx.description?.toLowerCase() || '';
            return userName.includes(term) || amount.includes(term) || description.includes(term);
        });
    }, [transactions, searchTerm]);

    const stats = [
        {
            icon: IndianRupee,
            title: 'Total Earned',
            value: `₹${summary?.totalEarned?.toLocaleString() || 0}`,
            color: 'bg-green-50 text-green-700',
            borderColor: 'border-green-100'
        },
        {
            icon: Zap,
            title: 'Top-Up Received',
            value: `₹${summary?.breakdown?.topUpsReceived?.toLocaleString() || 0}`,
            color: 'bg-blue-50 text-blue-700',
            borderColor: 'border-blue-100'
        }
    ];

    const columns = [
        {
            header: 'Type',
            render: (row) => {
                const isCredit = row.transactionType === 'credit' || row.transactionType === 'admin_adjustment';
                return (
                    <div className="flex items-center gap-2">
                        {isCredit ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`capitalize font-medium ${isCredit ? 'text-green-700' : 'text-red-700'}`}>
                            {row.transactionType?.replace('_', ' ') || 'Transaction'}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Amount',
            render: (row) => {
                const isCredit = row.transactionType === 'credit' || row.transactionType === 'admin_adjustment';
                return (
                    <span className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'} ₹{row.amount?.toLocaleString()}
                    </span>
                );
            }
        },
        {
            header: 'User Name',
            render: (row) => {
                const relatedUser = row.relatedId?.userId;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{relatedUser?.fullName || 'System'}</span>
                        <span className="text-xs text-gray-500">{relatedUser?._id?.substring(0, 8) || 'N/A'}{relatedUser?._id ? '...' : ''}</span>
                    </div>
                );
            }
        },
        {
            header: 'Description',
            accessor: 'description',
            render: (row) => <span className="text-sm text-gray-600">{row.description}</span>
        },
        {
            header: 'Date',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={14} />
                    {new Date(row.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Wallet</h1>
                    <p className="text-gray-600 mt-2">Manage your earnings and transaction history</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`bg-white p-6 rounded-2xl border ${stat.borderColor} shadow-sm flex items-center gap-4`}>
                            <div className={`p-4 rounded-xl ${stat.color}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, amount..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
                {isLoading && transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Fetching history...</p>
                    </div>
                ) : filteredTransactions.length > 0 ? (
                    <Table 
                        columns={columns} 
                        data={filteredTransactions} 
                    />
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <Filter className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No transactions found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
