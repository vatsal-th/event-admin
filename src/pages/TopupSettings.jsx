import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    QrCode, 
    Upload, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    RefreshCcw,
    Image as ImageIcon,
    Trash2,
    ExternalLink,
    TriangleAlert
} from 'lucide-react';
import { uploadAdminQrCodeAction, fetchQrCodeAction, deleteQrCodeAction, clearError } from '../store/slices/topupSlice';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const TopupSettings = () => {
    const dispatch = useDispatch();
    const { processing, error, currentQrCode, loading } = useSelector((state) => state.topups);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchQrCodeAction());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error('Please select a QR code image');
            return;
        }

        const formData = new FormData();
        formData.append('qrCode', selectedFile);

        try {
            await dispatch(uploadAdminQrCodeAction(formData)).unwrap();
            toast.success('QR Code updated successfully');
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsEditing(false);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteQrCodeAction()).unwrap();
            toast.success('QR Code deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    if (loading && !currentQrCode) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Fetching current settings...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Top-Up Settings</h1>
                        <p className="text-gray-600 mt-2">Manage the global QR code for agent top-up requests</p>
                    </div>
                </div>

                {currentQrCode && !isEditing ? (
                    /* View Mode: Display Current QR */
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 sm:p-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Active QR Code</h2>
                                        <p className="text-sm text-gray-500">Currently visible to all agents</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-blue-100 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors font-semibold text-sm cursor-pointer"
                                    >
                                        <RefreshCcw size={16} /> Update
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-100 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm cursor-pointer disabled:opacity-50"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-3xl p-8 border border-gray-100">
                                <div className="relative group">
                                    <img 
                                        src={currentQrCode.qrCode || currentQrCode} // Handle both {qrCode: url} and url
                                        alt="Active QR Code" 
                                        className="w-72 h-72 object-contain rounded-2xl shadow-xl bg-white p-6"
                                    />
                                    <a 
                                        href={currentQrCode.qrCode || currentQrCode} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-sm border border-gray-100 hover:bg-white transition-colors text-blue-600"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                                <div className="mt-8 text-center bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-bold text-gray-700">Publicly Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Edit/Upload Mode */
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 sm:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <QrCode size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{currentQrCode ? 'Update QR Code' : 'Upload New QR Code'}</h2>
                                        <p className="text-sm text-gray-500">Upload a photo containing the payment QR</p>
                                    </div>
                                </div>
                                {currentQrCode && (
                                    <button 
                                        onClick={() => { setIsEditing(false); setSelectedFile(null); setPreviewUrl(null); }}
                                        className="text-gray-500 hover:text-gray-900 text-sm font-bold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div
                                    className={`relative group border-2 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center ${
                                        dragActive 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    {previewUrl ? (
                                        <div className="relative group">
                                            <img 
                                                src={previewUrl} 
                                                alt="QR Preview" 
                                                className="w-64 h-64 object-contain rounded-2xl shadow-xl bg-white p-4"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                                    className="bg-white text-red-600 p-3 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                                                >
                                                    <RefreshCcw size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                                <Upload size={32} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">Click to upload or drag & drop</p>
                                                <p className="text-sm text-gray-500 mt-1">PNG, JPG or SVG (max. 5MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                                            <AlertCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">Security Requirement</p>
                                            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                                                Uploading a new QR code will override the existing one. Make sure you are using an official QR code to avoid payment failures.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!selectedFile || processing}
                                        className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:opacity-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={20} />
                                                {currentQrCode ? 'Confirm Update' : 'Save QR Code'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Helpful Tips Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                            <ImageIcon size={20} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm">Clear Image</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Use high resolution images for better scanner compatibility.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
                            <RefreshCcw size={20} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm">Instant Sync</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Changes reflected instantly without requiring server restart.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                            <CheckCircle2 size={20} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm">Safe & Secure</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Encrypted storage ensures your QR code data remains protected.</p>
                    </div>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete QR Code"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <TriangleAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Are you absolutely sure?</h3>
                            <p className="text-sm text-gray-500">This action cannot be undone.</p>
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <p className="text-sm text-red-800 leading-relaxed">
                            Deleting the global QR code will prevent all agents from seeing payment details during the top-up process.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-100"
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            Delete Now
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TopupSettings;

