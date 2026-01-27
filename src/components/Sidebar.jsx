import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    Users,
    Settings,
    UserCheck,
    Activity,
    MessageSquare,
    LogOut,
    X
} from 'lucide-react';

export default function Sidebar({ onLogout, onClose }) {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/applications', icon: FileText, label: 'Applications' },
        { path: '/employees', icon: UserCheck, label: 'Employees' },
        { path: '/activity-logs', icon: Activity, label: 'Activity Logs' },
        { path: '/complaints', icon: MessageSquare, label: 'Complaints' },
        { path: '/payment-requests', icon: CreditCard, label: 'Payment Requests' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];

    const handleLogout = () => {
        onLogout();
    };

    return (
        <div className="h-full flex flex-col">
            {/* Mobile close button */}
            <div className="lg:hidden p-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Event Admin</h1>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Logo - Desktop only */}
            <div className="hidden lg:block p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Event Admin</h1>
                <p className="text-sm text-gray-500 mt-1">Management Portal</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose} // Close sidebar on mobile when navigating
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">admin@event.com</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
