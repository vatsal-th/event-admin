import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Search,
    RefreshCw,
    Plus,
    Edit2,
    Trash2,
    Video,
    GraduationCap,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import {
    fetchTrainingApps,
    deleteTrainingApp,
    clearError,
} from '../store/slices/trainingAppSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TrainingAppModal from './TrainingAppModal';
import Pagination from '../components/Pagination';
import FilterDropdown from '../components/FilterDropdown';

const TrainingApps = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { apps, loading, error } = useSelector((state) => state.trainingApps);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchTrainingApps());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const filteredApps = useMemo(() => {
        return apps.filter((app) => {
            const matchesSearch =
                (app.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (app.description || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && app.isActive) ||
                (statusFilter === 'inactive' && !app.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [apps, searchQuery, statusFilter]);

    const paginatedApps = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredApps.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredApps, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const stats = useMemo(
        () => ({
            total: apps.length,
            active: apps.filter((app) => app.isActive).length,
            inactive: apps.filter((app) => !app.isActive).length,
        }),
        [apps]
    );

    const handleAddNew = () => {
        setEditingApp(null);
        setModalOpen(true);
    };

    const handleEdit = (app) => {
        setEditingApp(app);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteTrainingApp(id)).unwrap();
            toast.success('Training app deleted successfully');
            setDeleteConfirm(null);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    // Prevent body scroll when modals are open
    useEffect(() => {
        if (modalOpen || deleteConfirm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [modalOpen, deleteConfirm]);

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold">
                    <CheckCircle2 size={14} />
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold">
                <XCircle size={14} />
                Inactive
            </span>
        );
    };

    const StatCard = ({ title, count, icon: Icon, gradient }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${gradient} flex items-center justify-center`}>
                    <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {loading && apps.length === 0 ? (
                            <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                        ) : (
                            count
                        )}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Training Apps</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage training applications and videos</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg cursor-pointer whitespace-nowrap"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add New Training App</span>
                        <span className="sm:hidden">Add App</span>
                    </button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <StatCard
                        title="Total Apps"
                        count={stats.total}
                        icon={GraduationCap}
                        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Active Apps"
                        count={stats.active}
                        icon={CheckCircle2}
                        gradient="bg-gradient-to-br from-green-500 to-green-600"
                    />
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <FilterDropdown
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' }
                            ]}
                            className="min-w-[160px]"
                        />
                    </div>
                </div>

                {/* Training Apps List */}
                {loading && apps.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-16 text-center">
                        <GraduationCap size={48} className="mx-auto text-gray-300 mb-4 sm:w-16 sm:h-16" />
                        <p className="text-lg sm:text-xl font-semibold text-gray-600">No training apps found</p>
                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Get started by creating your first training app'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Table Header - Desktop */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-700 uppercase tracking-wide">
                            <div className="col-span-3">Title</div>
                            <div className="col-span-4">Description</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100">
                            {paginatedApps.map((app) => (
                                <div
                                    key={app._id}
                                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                        {/* Title */}
                                        <div className="lg:col-span-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                                                    <GraduationCap size={20} className="sm:w-6 sm:h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                                        {app.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        Created {new Date(app.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="lg:col-span-4">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {app.description || 'No description provided'}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div className="lg:col-span-2">{getStatusBadge(app.isActive)}</div>

                                        {/* Actions */}
                                        <div className="lg:col-span-3 flex justify-start lg:justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/training-apps/${app._id}/videos`)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                                                title="View Videos"
                                            >
                                                <Video className="w-4 h-4" />
                                                <span>Videos</span>
                                            </button>
                                            <button
                                                onClick={() => handleEdit(app)}
                                                className="p-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(app)}
                                                className="p-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredApps.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <TrainingAppModal
                    app={editingApp}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingApp(null);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                <AlertCircle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Delete Training App</h2>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to delete{' '}
                                <span className="font-bold">{deleteConfirm.title}</span>?
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                All associated videos will also be removed.
                            </p>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm._id)}
                                disabled={loading}
                                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingApps;
