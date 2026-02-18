import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Tag,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import {
    fetchCategories,
    deleteCategory,
    clearMessages,
} from '../store/slices/categorySlice';
import toast from 'react-hot-toast';
import CategoryModal from '../components/CategoryModal';
import Pagination from '../components/Pagination';
import FilterDropdown from '../components/FilterDropdown';

const CategoryManagement = () => {
    const dispatch = useDispatch();
    const { categories, loading, error, success } = useSelector((state) => state.categories);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearMessages());
        }
        if (success) {
            toast.success(success);
            dispatch(clearMessages());
        }
    }, [error, success, dispatch]);

    const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
            const matchesSearch = (category.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && category.status === 'active') ||
                (statusFilter === 'inactive' && category.status === 'inactive');

            return matchesSearch && matchesStatus;
        });
    }, [categories, searchQuery, statusFilter]);

    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCategories, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const stats = useMemo(
        () => ({
            total: categories.length,
            active: categories.filter((c) => c.status === 'active').length,
            inactive: categories.filter((c) => c.status === 'inactive').length,
        }),
        [categories]
    );

    const handleAddNew = () => {
        setEditingCategory(null);
        setModalOpen(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteCategory(id)).unwrap();
            setDeleteConfirm(null);
        } catch (err) {
            // Error handled by useEffect
        }
    };

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

    const getStatusBadge = (status) => {
        if (status === 'active') {
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
                        {loading && categories.length === 0 ? (
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Category Management</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage event categories for your platform</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg cursor-pointer whitespace-nowrap"
                    >
                        <Plus size={18} />
                        <span>Add Category</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <StatCard
                        title="Total Categories"
                        count={stats.total}
                        icon={Tag}
                        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                    <StatCard
                        title="Active Categories"
                        count={stats.active}
                        icon={CheckCircle2}
                        gradient="bg-gradient-to-br from-green-500 to-green-600"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>

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

                {loading && categories.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-16 text-center">
                        <Tag size={48} className="mx-auto text-gray-300 mb-4 sm:w-16 sm:h-16" />
                        <p className="text-lg sm:text-xl font-semibold text-gray-600">No categories found</p>
                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Get started by adding your first category'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-700 uppercase tracking-wide">
                            <div className="col-span-5">Name</div>
                            <div className="col-span-4">Status</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {paginatedCategories.map((category) => (
                                <div key={category._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                        <div className="lg:col-span-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                                                    <Tag size={18} />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                                    {category.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-4">{getStatusBadge(category.status)}</div>
                                        <div className="lg:col-span-3 flex justify-start lg:justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(category)}
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
                            totalItems={filteredCategories.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {modalOpen && (
                <CategoryModal
                    category={editingCategory}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingCategory(null);
                    }}
                />
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                <AlertCircle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Delete Category</h2>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to delete <span className="font-bold">{deleteConfirm.name}</span>?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm._id)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
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

export default CategoryManagement;
