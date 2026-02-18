import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Clock, CreditCard, XCircle, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchWithdrawalStats } from '../store/slices/withdrawalSlice';
import { fetchHostingApplications } from '../store/slices/hostingApplicationSlice';
import { fetchEventApplications } from '../store/slices/eventApplicationSlice';
import { fetchAgencyApplications } from '../store/slices/agencyApplicationSlice';
import { fetchInfluencerApplications } from '../store/slices/influencerApplicationSlice';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stats: withdrawalStats } = useSelector((state) => state.withdrawals);
    const { applications: hostingApps } = useSelector((state) => state.hostingApplications);
    const { applications: eventApps } = useSelector((state) => state.eventApplications);
    const { applications: agencyApps } = useSelector((state) => state.agencyApplications);
    const { applications: influencerApps } = useSelector((state) => state.influencerApplications);

    useEffect(() => {
        dispatch(fetchWithdrawalStats());
        dispatch(fetchHostingApplications());
        dispatch(fetchEventApplications());
        dispatch(fetchAgencyApplications());
        dispatch(fetchInfluencerApplications());
    }, [dispatch]);

    const totalApplications = (hostingApps || []).length + (eventApps || []).length + (agencyApps || []).length + (influencerApps || []).length;
    const pendingApplications = 
        (hostingApps || []).filter(app => app.status?.toLowerCase() === 'pending').length +
        (eventApps || []).filter(app => app.status?.toLowerCase() === 'pending').length +
        (agencyApps || []).filter(app => app.status?.toLowerCase() === 'pending').length +
        (influencerApps || []).filter(app => app.status?.toLowerCase() === 'pending').length;

    const stats = [
        {
            icon: FileText,
            title: 'Total Applications',
            value: totalApplications.toLocaleString(),
            badge: 'All types'
        },
        {
            icon: Clock,
            title: 'Pending Apps',
            value: pendingApplications.toLocaleString(),
            badge: 'Awaiting review'
        },
        {
            icon: CreditCard,
            title: 'Pending Payments',
            value: (withdrawalStats?.pendingCount || 0).toLocaleString(),
            badge: 'Awaiting approval'
        },
        {
            icon: XCircle,
            title: 'Rejected Payments',
            value: (withdrawalStats?.rejectedCount || 0).toLocaleString(),
            badge: 'Withdrawal requests'
        }
    ];

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your platform.</p>
                </div>
                <button 
                    onClick={() => {
                        dispatch(fetchWithdrawalStats());
                        dispatch(fetchHostingApplications());
                        dispatch(fetchEventApplications());
                        dispatch(fetchAgencyApplications());
                        dispatch(fetchInfluencerApplications());
                    }}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 cursor-pointer"
                    title="Refresh Data"
                >
                    <Activity className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        icon={stat.icon}
                        title={stat.title}
                        value={stat.value}
                        badge={stat.badge}
                    />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => navigate('/applications')}
                        className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm cursor-pointer"
                    >
                        Review Pending Applications
                    </button>
                    <button 
                        onClick={() => navigate('/payment-requests')}
                        className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm cursor-pointer"
                    >
                        Process Payments
                    </button>
                    <button 
                        onClick={() => navigate('/users')}
                        className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm cursor-pointer"
                    >
                        View All Users
                    </button>
                </div>
            </div>
        </div>
    );
}
