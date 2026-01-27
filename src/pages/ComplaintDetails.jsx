import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Clock,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2,
} from 'lucide-react';
import { complaintApi } from '../api/complaintApi';
import { resolveComplaintAction } from '../store/slices/complaintSlice';
import toast from 'react-hot-toast';

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [resolutionNote, setResolutionNote] = useState('');
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            const data = await complaintApi.getComplaintById(id);
            setComplaint(data);
        } catch (error) {
            toast.error('Failed to load complaint details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!resolutionNote.trim()) {
            toast.error('Please enter a resolution note');
            return;
        }
        try {
            setResolving(true);
            await dispatch(resolveComplaintAction({ id: complaint._id, resolutionNote })).unwrap();
            toast.success('Complaint resolved successfully');
            setResolveDialogOpen(false);
            setResolutionNote('');
            fetchComplaintDetails();
        } catch (err) {
            toast.error('Failed to resolve complaint');
        } finally {
            setResolving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-16 bg-gray-200 rounded-xl"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
                            <div className="h-96 bg-gray-200 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Complaint not found</h2>
                    <button
                        onClick={() => navigate('/complaints')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Complaints
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = complaint.status?.toLowerCase() === 'resolved'
        ? { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 }
        : { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle };

    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/complaints')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                        Back to Complaints
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Complaint Details</h1>
                            <p className="text-gray-600 mt-1">Ticket #{complaint.complaintNo}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                <StatusIcon size={16} />
                                {complaint.status || 'Pending'}
                            </span>
                            {complaint.status?.toLowerCase() !== 'resolved' && (
                                <button
                                    onClick={() => setResolveDialogOpen(true)}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
                                >
                                    Resolve Complaint
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Complaint Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            {/* Type Badge */}
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold mb-4">
                                {complaint.type}
                            </span>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">{complaint.title}</h2>

                            {/* Date & Time */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span className="font-medium">
                                        {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span className="font-medium">
                                        {new Date(complaint.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-6"></div>

                            {/* Description */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={18} className="text-gray-600" />
                                    <h3 className="text-lg font-bold text-gray-900">Description</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
                            </div>

                            {/* Photos */}
                            {complaint.photos && complaint.photos.length > 0 && (
                                <>
                                    <div className="border-t border-gray-100 my-6"></div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <ImageIcon size={18} className="text-gray-600" />
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Attachments ({complaint.photos.length})
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {complaint.photos.map((photo, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedImage(photo)}
                                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-400 hover:scale-105 transition-all duration-200"
                                                >
                                                    <img
                                                        src={photo}
                                                        alt={`Attachment ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Resolution */}
                            {complaint.resolutionNote && (
                                <>
                                    <div className="border-t border-gray-100 my-6"></div>
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 size={18} className="text-green-600" />
                                            <h3 className="text-lg font-bold text-green-900">Resolution</h3>
                                        </div>
                                        <p className="text-green-800 leading-relaxed">{complaint.resolutionNote}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* User Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">User Information</h3>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                    {complaint.userId?.fullName?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{complaint.userId?.fullName || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-600">ID: {complaint.userId?._id?.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-4"></div>

                            <div className="flex items-start gap-3">
                                <Mail size={18} className="text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="text-sm font-semibold text-gray-900 break-all">
                                        {complaint.email || complaint.userId?.email || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Complaint Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Complaint Info</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Ticket Number</p>
                                    <p className="text-sm font-bold text-blue-600">{complaint.complaintNo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Type</p>
                                    <p className="text-sm font-semibold text-gray-900">{complaint.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                        <StatusIcon size={14} />
                                        {complaint.status || 'Pending'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Submitted</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(complaint.createdAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="w-full rounded-2xl shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Resolve Dialog */}
            {resolveDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <AlertCircle size={24} className="text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Resolve Complaint</h2>
                                <p className="text-sm text-gray-600">Ticket #{complaint.complaintNo}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Resolution Notes
                            </label>
                            <textarea
                                autoFocus
                                rows={5}
                                placeholder="Describe how this issue was resolved..."
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setResolveDialogOpen(false);
                                    setResolutionNote('');
                                }}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={resolving || !resolutionNote.trim()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {resolving ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Resolving...
                                    </>
                                ) : (
                                    'Mark as Resolved'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintDetails;
