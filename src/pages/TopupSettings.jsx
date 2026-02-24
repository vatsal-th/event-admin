import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    QrCode, 
    CreditCard, 
    Banknote, 
    Loader2, 
    AlertCircle,
    Copy,
    Check,
    Image as ImageIcon,
    Upload,
    X,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import { 
    fetchAllPaymentMethods, 
    addPaymentMethodAction, 
    updatePaymentMethodAction, 
    deletePaymentMethodAction, 
    clearPaymentMethodError 
} from '../store/slices/paymentMethodSlice';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const TopupSettings = () => {
    const dispatch = useDispatch();
    const { methods, loading, processing, error } = useSelector((state) => state.paymentMethods);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [methodToDelete, setMethodToDelete] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        type: 'UPI',
        title: '',
        upiId: '',
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        status: 'active'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        dispatch(fetchAllPaymentMethods());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearPaymentMethodError());
        }
    }, [error, dispatch]);

    const handleOpenModal = (method = null) => {
        if (method) {
            setEditingMethod(method);
            setFormData({
                type: method.type,
                title: method.title || '',
                upiId: method.upiId || '',
                accountHolderName: method.accountHolderName || '',
                bankName: method.bankName || '',
                accountNumber: method.accountNumber || '',
                ifscCode: method.ifscCode || '',
                status: method.status || 'active'
            });
            setPreviewUrl(method.qrCode || null);
        } else {
            setEditingMethod(null);
            setFormData({
                type: 'UPI',
                title: '',
                upiId: '',
                accountHolderName: '',
                bankName: '',
                accountNumber: '',
                ifscCode: '',
                status: 'active'
            });
            setSelectedFile(null);
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('type', formData.type);
        data.append('title', formData.title);
        data.append('status', formData.status);

        if (formData.type === 'UPI') {
            data.append('upiId', formData.upiId);
        } else if (formData.type === 'NEFT') {
            data.append('accountHolderName', formData.accountHolderName);
            data.append('bankName', formData.bankName);
            data.append('accountNumber', formData.accountNumber);
            data.append('ifscCode', formData.ifscCode);
        } else if (formData.type === 'SCANNER') {
            if (selectedFile) {
                data.append('qrCode', selectedFile);
            } else if (!editingMethod && formData.type === 'SCANNER') {
                toast.error('Please upload a QR code image');
                return;
            }
        }

        try {
            if (editingMethod) {
                await dispatch(updatePaymentMethodAction({ id: editingMethod._id, formData: data })).unwrap();
                toast.success('Payment method updated');
            } else {
                await dispatch(addPaymentMethodAction(data)).unwrap();
                toast.success('Payment method added');
            }
            setIsModalOpen(false);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const handleDelete = async () => {
        if (!methodToDelete) return;
        try {
            await dispatch(deletePaymentMethodAction(methodToDelete._id)).unwrap();
            toast.success('Payment method deleted');
            setIsDeleteModalOpen(false);
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'UPI': return <QrCode size={20} className="text-purple-600" />;
            case 'NEFT': return <Banknote size={20} className="text-emerald-600" />;
            case 'SCANNER': return <ImageIcon size={20} className="text-blue-600" />;
            default: return <CreditCard size={20} />;
        }
    };

    if (loading && methods.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Loading payment methods...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
                        <p className="text-gray-600 mt-2">Manage payment options available for agent top-ups</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:opacity-95 transition-all cursor-pointer"
                    >
                        <Plus size={20} /> Add New Method
                    </button>
                </div>

                {methods.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <CreditCard size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No payment methods found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Get started by adding your first payment method like UPI, Bank Transfer or a QR Scanner.
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                            <Plus size={20} /> Add Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {methods.map((method) => (
                            <div key={method._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${
                                                method.type === 'UPI' ? 'bg-purple-50' : 
                                                method.type === 'NEFT' ? 'bg-emerald-50' : 'bg-blue-50'
                                            }`}>
                                                {getTypeIcon(method.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{method.title}</h3>
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                                    method.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {method.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleOpenModal(method)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => { setMethodToDelete(method); setIsDeleteModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-6">
                                        {method.type === 'UPI' && (
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">UPI ID</p>
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{method.upiId}</p>
                                                </div>
                                                <button onClick={() => copyToClipboard(method.upiId)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {method.type === 'NEFT' && (
                                            <div className="space-y-2">
                                                <div className="p-3 bg-gray-50 rounded-2xl">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Account Holder</p>
                                                    <p className="text-sm font-semibold text-gray-900">{method.accountHolderName}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="p-3 bg-gray-50 rounded-2xl">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Bank</p>
                                                        <p className="text-xs font-semibold text-gray-900">{method.bankName}</p>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 rounded-2xl">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">IFSC</p>
                                                        <p className="text-xs font-semibold text-gray-900">{method.ifscCode}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                                    <div className="overflow-hidden">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Account Number</p>
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{method.accountNumber}</p>
                                                    </div>
                                                    <button onClick={() => copyToClipboard(method.accountNumber)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {method.type === 'SCANNER' && (
                                            <div className="mt-4 flex justify-center">
                                                <div className="relative group">
                                                    <img 
                                                        src={method.qrCode} 
                                                        alt={method.title} 
                                                        className="w-full aspect-square max-h-48 object-contain rounded-2xl border border-gray-100 p-2 bg-white"
                                                    />
                                                    <a 
                                                        href={method.qrCode} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-lg shadow-sm border border-gray-100 hover:bg-white transition-colors text-blue-600"
                                                    >
                                                        <ImageIcon size={14} />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Method Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                required
                            >
                                <option value="UPI">UPI</option>
                                <option value="NEFT">Bank Transfer (NEFT)</option>
                                <option value="SCANNER">QR Scanner</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Display Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. PhonePe UPI, HDFC Bank"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.status === 'active'}
                                    onChange={() => setFormData({ ...formData, status: 'active' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.status === 'inactive'}
                                    onChange={() => setFormData({ ...formData, status: 'inactive' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm font-medium">Inactive</span>
                            </label>
                        </div>
                    </div>

                    {formData.type === 'UPI' && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">UPI ID</label>
                            <input
                                type="text"
                                value={formData.upiId}
                                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                placeholder="username@upi"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                required
                            />
                        </div>
                    )}

                    {formData.type === 'NEFT' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Account Holder Name</label>
                                <input
                                    type="text"
                                    value={formData.accountHolderName}
                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Bank Name</label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">IFSC Code</label>
                                <input
                                    type="text"
                                    value={formData.ifscCode}
                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {(formData.type === 'SCANNER' || formData.type === 'UPI' || formData.type === 'NEFT') && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">
                                {formData.type === 'SCANNER' ? 'QR Code Image' : 'QR Code Image (Optional)'}
                            </label>
                            <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center ${
                                previewUrl ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                {previewUrl ? (
                                    <div className="relative">
                                        <img src={previewUrl} alt="Preview" className="w-32 h-32 object-contain rounded-lg" />
                                        <button 
                                            type="button"
                                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                            className="absolute -top-2 -right-2 bg-white text-red-600 p-1 rounded-full shadow-md border border-gray-100 hover:bg-red-50"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">Click to upload QR code</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required={formData.type === 'SCANNER' && !editingMethod}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-100"
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            {editingMethod ? 'Save Changes' : 'Add Method'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Payment Method"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Remove Method?</h3>
                            <p className="text-sm text-gray-500">This action cannot be undone.</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        Are you sure you want to delete <span className="font-bold">"{methodToDelete?.title}"</span>? Agents will no longer be able to use this method for top-ups.
                    </p>

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
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TopupSettings;
