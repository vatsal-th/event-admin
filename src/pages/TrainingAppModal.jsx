import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Loader2, Save } from 'lucide-react';
import { createTrainingApp, updateTrainingApp } from '../store/slices/trainingAppSlice';
import toast from 'react-hot-toast';

const TrainingAppModal = ({ app, onClose }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.trainingApps);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isActive: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (app) {
            setFormData({
                title: app.title || '',
                description: app.description || '',
                isActive: app.isActive !== undefined ? app.isActive : true,
            });
        }
    }, [app]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            if (app) {
                // Update existing app
                await dispatch(updateTrainingApp({ id: app._id, data: formData })).unwrap();
                toast.success('Training app updated successfully');
            } else {
                // Create new app
                await dispatch(createTrainingApp(formData)).unwrap();
                toast.success('Training app created successfully');
            }
            onClose();
        } catch (err) {
            // Error handled by Redux slice and useEffect in parent
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex-1 min-w-0 pr-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {app ? 'Edit Training App' : 'Add New Training App'}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {app ? 'Update training app details' : 'Create a new training application'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., React Basics Training"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-xl bg-white focus:ring-2 outline-none transition-all ${errors.title
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                        />
                        {errors.title && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <span>⚠</span> {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Provide a brief description of the training app..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    {app ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    {app ? 'Update App' : 'Create App'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TrainingAppModal;
