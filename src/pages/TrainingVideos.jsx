import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight,
    Plus,
    Trash2,
    Video,
    GraduationCap,
    Loader2,
    AlertCircle,
    Clock,
    ArrowLeft,
} from 'lucide-react';
import {
    fetchTrainingAppVideos,
    deleteVideo,
    clearError,
    clearVideos,
} from '../store/slices/trainingAppSlice';
import toast from 'react-hot-toast';
import AddVideoModal from './AddVideoModal';
import Pagination from '../components/Pagination';

const TrainingVideos = () => {
    const { appId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { apps, videos, loading, error } = useSelector((state) => state.trainingApps);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Grid looks better with 3 columns, so multiples of 3

    const currentApp = apps.find((app) => app._id === appId);

    useEffect(() => {
        if (appId) {
            dispatch(fetchTrainingAppVideos(appId));
        }

        return () => {
            dispatch(clearVideos());
        };
    }, [appId, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Prevent body scroll when delete modal is open
    useEffect(() => {
        if (deleteConfirm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [deleteConfirm]);

    const paginatedVideos = videos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [videos.length]);

    const handleDelete = async (videoId) => {
        try {
            await dispatch(deleteVideo(videoId)).unwrap();
            toast.success('Video deleted successfully');
            setDeleteConfirm(null);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const getVideoThumbnail = (url) => {
        // Extract YouTube video ID
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (youtubeMatch) {
            return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
        }

        // Extract Vimeo video ID
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            // Vimeo thumbnails require API call, so we'll use a placeholder
            return null;
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
                    <Link
                        to="/admin/training-apps"
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        Training Apps
                    </Link>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{currentApp?.title || 'Videos'}</span>
                </div>

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                                    {currentApp?.title || 'Training App'}
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">
                                    {currentApp?.description || 'Manage training videos'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                                        {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg cursor-pointer whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Add New Video</span>
                            <span className="sm:hidden">Add Video</span>
                        </button>
                    </div>
                </div>

                {/* Videos List */}
                {loading && videos.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse"></div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-16 text-center">
                        <Video className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg sm:text-xl font-semibold text-gray-600">No videos yet</p>
                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            Get started by adding your first training video
                        </p>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="mt-4 sm:mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            Add First Video
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {paginatedVideos.map((video, index) => {
                            const thumbnail = getVideoThumbnail(video.videoUrl);

                            return (
                                <div
                                    key={video._id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Video Thumbnail */}
                                    <div className="relative bg-gray-900 aspect-video">
                                        {thumbnail ? (
                                            <img
                                                src={thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Video className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-1 bg-black bg-opacity-75 text-white text-xs font-bold rounded">
                                            #{video.order || index + 1}
                                        </div>
                                        {video.duration && (
                                            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 px-2 py-1 bg-black bg-opacity-75 text-white text-xs font-bold rounded flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {video.duration}
                                            </div>
                                        )}
                                    </div>

                                    {/* Video Info */}
                                    <div className="p-3 sm:p-4">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {video.title}
                                        </h3>
                                        {video.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                {video.description}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <a
                                                href={video.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center cursor-pointer"
                                            >
                                                Watch
                                            </a>
                                            <button
                                                onClick={() => setDeleteConfirm(video)}
                                                className="px-3 sm:px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {videos.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={videos.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Add Video Modal */}
            {modalOpen && <AddVideoModal appId={appId} onClose={() => setModalOpen(false)} />}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                <AlertCircle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Delete Video</h2>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to delete{' '}
                                <span className="font-bold">{deleteConfirm.title}</span>?
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

export default TrainingVideos;
