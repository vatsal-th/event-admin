import { useState, useEffect } from 'react';
import { Plus, Users, Search, Edit, Trash2, Eye } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import { employeeApi } from '../api/employeeApi';
import {
    Select,
    MenuItem,
    FormControl,
    Checkbox,
    FormControlLabel
} from '@mui/material';

export default function Employees() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch employees on component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await employeeApi.getAllEmployees();
            const employeesData = data.employees || data;
           const formattedEmployees = employeesData.map(emp => {
                const lastLogin = new Date(emp.lastLogin);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                // Consider active if logged in within last 30 days, otherwise inactive
                const status = lastLogin > thirtyDaysAgo ? 'active' : 'inactive';

                return {
                    ...emp,
                    id: emp.id || emp._id,
                    status: emp.status || status // Use API status if available, otherwise calculated
                };
            });
            setEmployees(formattedEmployees);
        } catch (err) {
            setError(err.message || 'Failed to fetch employees');
            toast.error('Failed to load employees');
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'all', label: 'All Employees', count: employees.length },
        { id: 'active', label: 'Active', count: employees.filter(e => e.status === 'active').length },
        { id: 'inactive', label: 'Inactive', count: employees.filter(e => e.status === 'inactive').length }
    ];

    const filteredEmployees = employees.filter(employee => {
        const matchesTab = activeTab === 'all' ||
                          (activeTab === 'active' && employee.status === 'active') ||
                          (activeTab === 'inactive' && employee.status === 'inactive');

        const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             employee.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleEditEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleDeleteEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setIsDeleteModalOpen(true);
    };

    const handleAddEmployee = async (formData) => {
        try {
            setIsSubmitting(true);
            await employeeApi.addEmployee(formData);
            toast.success('Employee added successfully!');
            setIsAddModalOpen(false);
            // Refresh the employees list
            await fetchEmployees();
        } catch (err) {
            toast.error(err.message || 'Failed to add employee');
            console.error('Error adding employee:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditEmployee = async (employeeId, formData) => {
        try {
            setIsSubmitting(true);
            await employeeApi.updateEmployee(employeeId, formData);
            toast.success('Employee updated successfully!');
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
            // Refresh the employees list
            await fetchEmployees();
        } catch (err) {
            toast.error(err.message || 'Failed to update employee');
            console.error('Error updating employee:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        try {
            await employeeApi.deleteEmployee(employeeId);
            toast.success('Employee deleted successfully!');
            setIsDeleteModalOpen(false);
            setSelectedEmployee(null);
            // Refresh the employees list
            await fetchEmployees();
        } catch (err) {
            toast.error(err.message || 'Failed to delete employee');
            console.error('Error deleting employee:', err);
        }
    };

    const getPermissionLabel = (permission) => {
        const labels = {
            'apply_event': 'Apply Events',
            'accept_event': 'Accept Events',
            'manage_users': 'Manage Users',
            'manage_payments': 'Manage Payments',
            'view_reports': 'View Reports'
        };
        return labels[permission] || permission;
    };

    const columns = [
        {
            header: 'Employee',
            accessor: 'fullName',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {row.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.fullName}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Gender',
            accessor: 'gender',
            render: (row) => (
                <span className="capitalize text-sm text-gray-600">{row.gender}</span>
            )
        },
        {
            header: 'Permissions',
            accessor: 'permissions',
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.permissions.slice(0, 2).map((perm, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                            {getPermissionLabel(perm)}
                        </span>
                    ))}
                    {row.permissions.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{row.permissions.length - 2} more
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Last Login',
            accessor: 'lastLogin',
            render: (row) => {
                const date = new Date(row.lastLogin);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewEmployee(row)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleEditEmployeeClick(row)}
                        className="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        title="Edit Employee"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteEmployeeClick(row)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Employee"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Employee Management</h1>
                        <p className="text-gray-600 mt-2 text-sm lg:text-base">Manage staff members and their permissions</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 lg:px-6 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer shadow-sm"
                    >
                        <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        <span className="hidden sm:inline">Add Employee</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm text-gray-600 truncate">Total Employees</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">{employees.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 bg-green-100 rounded-lg flex-shrink-0">
                            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm text-gray-600 truncate">Active Employees</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {employees.filter(e => e.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 bg-gray-100 rounded-lg flex-shrink-0">
                            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm text-gray-600 truncate">Inactive Employees</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {employees.filter(e => e.status === 'inactive').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="border-b border-gray-200 w-full lg:w-auto">
                        <div className="flex gap-4 lg:gap-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 lg:pb-4 px-2 font-medium text-sm transition-all duration-200 border-b-2 cursor-pointer whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            {loading ? (
                <div className="bg-white p-8 lg:p-12 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Employees</h3>
                        <p className="text-gray-600">Please wait while we fetch the employee data...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white p-8 lg:p-12 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Employees</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <button
                            onClick={fetchEmployees}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Try Again
                        </button>
                    </div>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="bg-white p-8 lg:p-12 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || activeTab !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No employees have been added yet. Click "Add Employee" to get started.'}
                        </p>
                        {activeTab === 'all' && !searchTerm && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Employee
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredEmployees} />
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddEmployee}
                isLoading={isSubmitting}
            />

            {/* Edit Employee Modal */}
            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEmployee(null);
                }}
                onSubmit={handleEditEmployee}
                employee={selectedEmployee}
                isLoading={isSubmitting}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedEmployee(null);
                }}
                onConfirm={handleDeleteEmployee}
                employee={selectedEmployee}
                isLoading={isSubmitting}
            />

            {/* View Employee Modal */}
            <ViewEmployeeModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                employee={selectedEmployee}
            />
        </div>
    );
}

// Add Employee Modal Component
function AddEmployeeModal({ isOpen, onClose, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        gender: 'male',
        permissions: []
    });

    const availablePermissions = [
        { id: 'apply_event', label: 'Apply Events' },
        { id: 'accept_event', label: 'Accept Events' },
        { id: 'manage_users', label: 'Manage Users' },
        { id: 'manage_payments', label: 'Manage Payments' },
        { id: 'view_reports', label: 'View Reports' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            fullName: '',
            email: '',
            password: '',
            gender: 'male',
            permissions: []
        });
    };

    const handlePermissionChange = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Employee"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter email address"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                        </label>
                        <FormControl fullWidth variant="outlined" size="small">
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                className="bg-white"
                            >
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Permissions
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availablePermissions.map((permission) => (
                            <FormControlLabel
                                key={permission.id}
                                control={
                                    <Checkbox
                                        checked={formData.permissions.includes(permission.id)}
                                        onChange={() => handlePermissionChange(permission.id)}
                                        color="primary"
                                        size="small"
                                    />
                                }
                                label={<span className="text-sm text-gray-700">{permission.label}</span>}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Adding...
                            </>
                        ) : (
                            'Add Employee'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// View Employee Modal Component
function ViewEmployeeModal({ isOpen, onClose, employee }) {
    if (!employee) return null;

    const getPermissionLabel = (permission) => {
        const labels = {
            'apply_event': 'Apply Events',
            'accept_event': 'Accept Events',
            'manage_users': 'Manage Users',
            'manage_payments': 'Manage Payments',
            'view_reports': 'View Reports'
        };
        return labels[permission] || permission;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Employee Details"
            size="lg"
        >
            <div className="space-y-6">
                {/* Employee Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {employee.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{employee.fullName}</h3>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                    </div>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-base text-gray-900 mt-1">{employee.fullName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-base text-gray-900 mt-1">{employee.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="text-base text-gray-900 mt-1 capitalize">{employee.gender}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Created Date</p>
                        <p className="text-base text-gray-900 mt-1">
                            {new Date(employee.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Last Login</p>
                        <p className="text-base text-gray-900 mt-1">
                            {new Date(employee.lastLogin).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Permissions */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                        {employee.permissions.map((permission, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                                {getPermissionLabel(permission)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

// Edit Employee Modal Component
function EditEmployeeModal({ isOpen, onClose, onSubmit, employee, isLoading }) {
    const [formData, setFormData] = useState({
        fullName: '',
        permissions: []
    });

    // Update form data when employee changes
    useEffect(() => {
        if (employee) {
            setFormData({
                fullName: employee.fullName || '',
                permissions: employee.permissions || []
            });
        }
    }, [employee]);

    const availablePermissions = [
        { id: 'apply_event', label: 'Apply Events' },
        { id: 'accept_event', label: 'Accept Events' },
        { id: 'manage_users', label: 'Manage Users' },
        { id: 'manage_payments', label: 'Manage Payments' },
        { id: 'view_reports', label: 'View Reports' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (employee) {
            const employeeId = employee.id || employee._id;
            onSubmit(employeeId, formData);
        }
    };

    const handlePermissionChange = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    if (!employee) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Employee"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter full name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Permissions
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availablePermissions.map((permission) => (
                            <FormControlLabel
                                key={permission.id}
                                control={
                                    <Checkbox
                                        checked={formData.permissions.includes(permission.id)}
                                        onChange={() => handlePermissionChange(permission.id)}
                                        color="primary"
                                        size="small"
                                    />
                                }
                                label={<span className="text-sm text-gray-700">{permission.label}</span>}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating...
                            </>
                        ) : (
                            'Update Employee'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, employee, isLoading }) {
    const handleConfirm = () => {
        if (employee) {
            const employeeId = employee.id || employee._id;
            onConfirm(employeeId);
        }
    };

    if (!employee) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Employee"
            size="md"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-shrink-0">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Delete Employee</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Are you sure you want to delete <strong>{employee.fullName}</strong>? This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Employee Details:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Name:</strong> {employee.fullName}</p>
                        <p><strong>Email:</strong> {employee.email}</p>
                        <p><strong>Permissions:</strong> {employee.permissions?.length || 0}</p>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete Employee
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}