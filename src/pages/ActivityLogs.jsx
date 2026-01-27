import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, FileText, Users, Shield, Trash2, Settings } from 'lucide-react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import { employeeApi } from '../api/employeeApi';
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

export default function ActivityLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch activity logs on component mount
    useEffect(() => {
        fetchActivityLogs();
    }, []);

    const fetchActivityLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await employeeApi.getActivityLogs();
            setActivityLogs(data.logs || data); // Handle different response formats
        } catch (err) {
            setError(err.message || 'Failed to fetch activity logs');
            toast.error('Failed to load activity logs');
            console.error('Error fetching activity logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterOptions = [
        { value: 'all', label: 'All Activities' },
        { value: 'Added Employee', label: 'Employee Management' },
        { value: 'Updated Employee', label: 'Employee Updates' },
        { value: 'Deleted Employee', label: 'Employee Deletions' },
        { value: 'Approved Application', label: 'Application Approvals' },
        { value: 'Rejected Application', label: 'Application Rejections' },
        { value: 'Processed Payment', label: 'Payment Processing' },
        { value: 'Login', label: 'Login Activities' },
        { value: 'Updated Settings', label: 'Settings Updates' }
    ];

    const filteredLogs = activityLogs.filter(log => {
        const matchesSearch = (log.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (log.user?.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (log.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || log.action === filterType;

        const matchesDate = !filterDate || (log.timestamp?.startsWith(filterDate) ?? false);

        return matchesSearch && matchesType && matchesDate;
    });

    const getActionIcon = (action) => {
        switch (action) {
            case 'Added Employee':
            case 'Updated Employee':
                return <Users className="w-4 h-4 text-blue-600" />;
            case 'Deleted Employee':
                return <Trash2 className="w-4 h-4 text-red-600" />;
            case 'Approved Application':
                return <Shield className="w-4 h-4 text-green-600" />;
            case 'Rejected Application':
                return <Shield className="w-4 h-4 text-red-600" />;
            case 'Processed Payment':
                return <FileText className="w-4 h-4 text-purple-600" />;
            case 'Login':
                return <User className="w-4 h-4 text-blue-600" />;
            case 'Updated Settings':
                return <Settings className="w-4 h-4 text-gray-600" />;
            default:
                return <FileText className="w-4 h-4 text-gray-600" />;
        }
    };

    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'Added Employee':
            case 'Updated Employee':
                return 'success';
            case 'Deleted Employee':
            case 'Rejected Application':
                return 'error';
            case 'Approved Application':
                return 'success';
            case 'Processed Payment':
                return 'warning';
            case 'Login':
                return 'info';
            case 'Updated Settings':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const columns = [
        {
            header: 'Action',
            accessor: 'action',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        {getActionIcon(row.action)}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.action}</p>
                        <p className="text-xs text-gray-500">{row.user?.fullName}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Description',
            accessor: 'details',
            render: (row) => (
                <div>
                    <p className="text-gray-900">{row.details}</p>
                    <p className="text-xs text-gray-500">{row.user?.email}</p>
                </div>
            )
        },
        {
            header: 'Target',
            accessor: 'targetType',
            render: (row) => (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                    {row.targetType || 'System'}
                </span>
            )
        },
        {
            header: 'Timestamp',
            accessor: 'timestamp',
            render: (row) => {
                const date = new Date(row.timestamp);
                return (
                    <div>
                        <p className="text-gray-900">
                            {date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                        <p className="text-xs text-gray-500">
                            {date.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                );
            }
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-2 text-sm lg:text-base">Track all admin activities and system events</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm text-gray-600 truncate">Total Activities</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">{activityLogs.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 bg-green-100 rounded-lg flex-shrink-0">
                            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm text-gray-600 truncate">Employee Actions</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {activityLogs.filter(log => log.action?.includes('Employee')).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                            <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm text-gray-600 truncate">Application Actions</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {activityLogs.filter(log => log.action?.includes('Application')).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                            <User className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm text-gray-600 truncate">Login Activities</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {activityLogs.filter(log => log.action === 'Login').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                        />
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Filter by Activity Type</InputLabel>
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                label="Filter by Activity Type"
                                className="bg-white cursor-pointer"
                            >
                                {filterOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Logs Table */}
            {loading ? (
                <div className="bg-white p-8 lg:p-12 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Activity Logs</h3>
                        <p className="text-gray-600">Please wait while we fetch the latest activities...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white p-8 lg:p-12 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Activity Logs</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <button
                            onClick={fetchActivityLogs}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Try Again
                        </button>
                    </div>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="bg-white p-8 lg:p-12 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Logs Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterType !== 'all' || filterDate
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No activities have been logged yet.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredLogs} />
                    </div>
                </div>
            )}
        </div>
    );
}