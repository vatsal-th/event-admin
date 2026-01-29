import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Loader2, Save, Video } from 'lucide-react';
import { addVideo } from '../store/slices/trainingAppSlice';
import toast from 'react-hot-toast';

const AddVideoModal = ({ appId, onClose }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.trainingApps);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        order: '',
    });

    const [errors, setErrors] = useState({});

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const validateUrl = (url) => {
        // YouTube URL patterns
        const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
        // Vimeo URL pattern
        const vimeoPattern = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/;

        return youtubePattern.test(url) || vimeoPattern.test(url);
    };

    const validateDuration = (duration) => {
        if (!duration) return true; // Optional field
        // Format: MM:SS or HH:MM:SS
        const durationPattern = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/;
        return durationPattern.test(duration);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.videoUrl.trim()) {
            newErrors.videoUrl = 'Video URL is required';
        } else if (!validateUrl(formData.videoUrl)) {
            newErrors.videoUrl = 'Please enter a valid YouTube or Vimeo URL';
        }

        if (formData.duration && !validateDuration(formData.duration)) {
            newErrors.duration = 'Duration must be in MM:SS or HH:MM:SS format';
        }

        if (formData.order && (isNaN(formData.order) || parseInt(formData.order) < 1)) {
            newErrors.order = 'Order must be a positive number';
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
            const videoData = {
                title: formData.title,
                description: formData.description,
                videoUrl: formData.videoUrl,
                duration: formData.duration || undefined,
                order: formData.order ? parseInt(formData.order) : undefined,
            };

            await dispatch(addVideo({ appId, data: videoData })).unwrap();
            toast.success('Video added successfully');
            onClose();
        } catch (err) {
            // Error handled by Redux slice and useEffect in parent
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Video</h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Add a training video from YouTube or Vimeo
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
                            Video Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Introduction to React"
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
                            rows={3}
                            placeholder="Brief description of what this video covers..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional</p>
                    </div>

                    {/* Video URL */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Video URL <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/watch?v=example123"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-xl bg-white focus:ring-2 outline-none transition-all ${errors.videoUrl
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                        />
                        {errors.videoUrl && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <span>⚠</span> {errors.videoUrl}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Supported: YouTube and Vimeo links
                        </p>
                    </div>

                    {/* Duration and Order - Side by Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Duration
                            </label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="15:30 or 1:15:30"
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-xl bg-white focus:ring-2 outline-none transition-all ${errors.duration
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                            />
                            {errors.duration && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠</span> {errors.duration}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Format: MM:SS or HH:MM:SS</p>
                        </div>

                        {/* Order */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Order
                            </label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                placeholder="1"
                                min="1"
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-xl bg-white focus:ring-2 outline-none transition-all ${errors.order
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                            />
                            {errors.order && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠</span> {errors.order}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Video sequence number</p>
                        </div>
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
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Add Video
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVideoModal;
