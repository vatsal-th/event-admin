import StatCard from '../components/StatCard';
import { FileText, Clock, CreditCard, XCircle } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        {
            icon: FileText,
            title: 'Total Applications',
            value: '1,240',
            badge: 'All time'
        },
        {
            icon: Clock,
            title: 'Pending Applications',
            value: '45',
            badge: 'Awaiting review'
        },
        {
            icon: CreditCard,
            title: 'Pending Payments',
            value: '23',
            badge: 'Awaiting approval'
        },
        {
            icon: XCircle,
            title: 'Total Rejected',
            value: '12',
            badge: 'This month'
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your platform.</p>
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
                    <button className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm cursor-pointer">
                        Review Pending Applications
                    </button>
                    <button className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm cursor-pointer">
                        Process Payments
                    </button>
                    <button className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm cursor-pointer">
                        View All Users
                    </button>
                </div>
            </div>
        </div>
    );
}
