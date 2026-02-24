import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Users, Briefcase, FileText, CheckCircle, Clock, XCircle, 
    TrendingUp, Wallet, AlertCircle, Activity, ArrowUpRight,
    ArrowDownRight, IndianRupee, RefreshCw
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../store/slices/authSlice';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const { stats, loading } = useSelector((state) => state.dashboard);

    const refreshData = () => {
        dispatch(fetchDashboardStats());
    };

    useEffect(() => {
        refreshData();
    }, [dispatch]);

    // Data Transformation for Charts
    const applicationData = useMemo(() => {
        if (!stats?.applications) return [];
        return [
            { name: 'Hosting', pending: stats.applications.hosting.pending, approved: stats.applications.hosting.approved, rejected: stats.applications.hosting.rejected },
            { name: 'Events', pending: stats.applications.events.pending, approved: stats.applications.events.approved, rejected: stats.applications.events.rejected || 0 },
            { name: 'Agency', pending: stats.applications.agency.pending || 0, approved: stats.applications.agency.approved, rejected: stats.applications.agency.rejected || 0 },
            { name: 'Influencer', pending: stats.applications.influencer.pending, approved: stats.applications.influencer.approved, rejected: stats.applications.influencer.rejected || 0 },
        ];
    }, [stats]);

    const financialData = useMemo(() => {
        if (!stats?.financials) return [];
        return [
            { name: 'Withdrawals', amount: stats.financials.withdrawals.approvedAmount || 0, count: stats.financials.withdrawals.total },
            { name: 'Recharges', amount: stats.financials.recharges.approvedAmount || 0, count: stats.financials.recharges.total },
            { name: 'Topups', amount: stats.financials.topups.approvedAmount || 0, count: stats.financials.topups.total },
        ];
    }, [stats]);

    const complaintData = useMemo(() => {
        if (!stats?.complaints) return [];
        return [
            { name: 'Pending', value: stats.complaints.pending },
            { name: 'Resolved', value: stats.complaints.resolved },
        ];
    }, [stats]);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const totalRevenue = (stats?.financials?.recharges?.approvedAmount || 0) + (stats?.financials?.topups?.approvedAmount || 0);

    return (
        <div className="p-1 md:p-3">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600">
                        Admin Overview
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        System metrics and performance summary
                    </p>
                </div>
                <button 
                    onClick={refreshData}
                    className="group bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium cursor-pointer active:scale-95"
                >
                    <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Stats
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            {stats?.users?.employees || 0} Staff
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-500">Total Platform Users</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.users?.total || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            Overview
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-500">Total Income Flow</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-amber-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {stats?.applications?.hosting?.pending + stats?.applications?.events?.pending + stats?.applications?.agency?.pending + stats?.applications?.influencer?.pending || 0} New
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-500">Pending Applications</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats?.applications?.hosting?.pending + stats?.applications?.events?.pending + stats?.applications?.agency?.pending + stats?.applications?.influencer?.pending || 0}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-rose-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            {stats?.complaints?.pending || 0} Open
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-500">Active Complaints</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.complaints?.total || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Application breakdown Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Applications Analysis</h2>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-amber-600">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Pending
                            </div>
                            <div className="flex items-center gap-1.5 font-medium text-emerald-600">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Approved
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={applicationData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f9f9f9'}} 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                                />
                                <Bar dataKey="pending" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Financial Overview Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Financial Summary (INR)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financialData}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Complaints Donut */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 w-full">Complaint Status</h2>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={complaintData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {complaintData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#10b981'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">Total Resolution Rate</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {stats?.complaints?.total > 0 
                                ? Math.round((stats.complaints.resolved / stats.complaints.total) * 100) 
                                : 0}%
                        </p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent System Activity</h2>
                        <button 
                            onClick={() => navigate('/activity-logs')}
                            className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            View All <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((log, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className={`p-2 rounded-lg ${
                                        log.action?.toLowerCase().includes('approve') ? 'bg-emerald-50 text-emerald-600' :
                                        log.action?.toLowerCase().includes('reject') ? 'bg-rose-50 text-rose-600' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.description || 'System event triggered'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-gray-400">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400">No recent activity logs found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Access */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { label: 'Manage Users', path: '/users', color: 'bg-blue-600' },
                    { label: 'Applications', path: '/applications', color: 'bg-indigo-600' },
                    { label: 'Recharge Requests', path: '/recharge-requests', color: 'bg-emerald-600' },
                    { label: 'Withdrawal Req', path: '/payment-requests', color: 'bg-rose-600' }
                 ].map((action, i) => (
                    <button 
                        key={i}
                        onClick={() => navigate(action.path)}
                        className={`${action.color} text-white p-4 rounded-2xl shadow-sm hover:opacity-90 transition-opacity font-bold text-sm cursor-pointer active:scale-95`}
                    >
                        {action.label}
                    </button>
                 ))}
            </div>
        </div>
    );
}

