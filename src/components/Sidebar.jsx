import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
    X,
    GraduationCap,
    Globe,
    Tag,
    LayoutGrid,
    ChevronDown,
    ChevronRight,
    Library,
    Landmark
} from 'lucide-react';

export default function Sidebar({ onLogout, onClose }) {
    const location = useLocation();
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/applications', icon: FileText, label: 'Applications' },
        { path: '/employees', icon: UserCheck, label: 'Employees' },
        { path: '/activity-logs', icon: Activity, label: 'Activity Logs' },
        { path: '/complaints', icon: MessageSquare, label: 'Complaints' },
        { path: '/admin/training-apps', icon: GraduationCap, label: 'Training Apps' },
        {
            label: 'Master Management',
            icon: Library,
            isDropdown: true,
            children: [
                { path: '/admin/countries', icon: Globe, label: 'Countries' },
                { path: '/admin/categories', icon: Tag, label: 'Categories' },
                { path: '/admin/apps', icon: LayoutGrid, label: 'Apps' },
            ]
        },
        { path: '/bank-details', icon: Landmark, label: 'Bank Verification' },
        { path: '/payment-requests', icon: CreditCard, label: 'Withdrawal Requests' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];

    // Auto-expand dropdown if a child route is active
    useEffect(() => {
        const adminRoutes = ['/admin/countries', '/admin/categories', '/admin/apps'];
        if (adminRoutes.some(route => location.pathname.startsWith(route))) {
            setIsAdminOpen(true);
        }
    }, [location.pathname]);

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
                {navItems.map((item, index) => {
                    const Icon = item.icon;

                    if (item.isDropdown) {
                        const isAnyChildActive = item.children.some(child => location.pathname === child.path);

                        return (
                            <div key={index} className="space-y-1">
                                <button
                                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isAnyChildActive
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${isAnyChildActive ? 'text-blue-700' : 'text-gray-500'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {isAdminOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>

                                {isAdminOpen && (
                                    <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            const isChildActive = location.pathname === child.path;

                                            return (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    onClick={onClose}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isChildActive
                                                        ? 'bg-blue-100 text-blue-800 font-bold'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <ChildIcon className={`w-4 h-4 ${isChildActive ? 'text-blue-800' : 'text-gray-400'}`} />
                                                    <span className="text-sm">{child.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const isActive = location.pathname === item.path ||
                        (item.path === '/admin/training-apps' && location.pathname.startsWith('/admin/training-apps'));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
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
