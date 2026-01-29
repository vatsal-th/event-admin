import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Loader2, Layout, CheckCircle2} from 'lucide-react';
import { addApp, updateApp } from '../store/slices/appSlice';

const AppModal = ({ app, onClose }) => {
    const dispatch = useDispatch();
    const { loading: appsLoading } = useSelector((state) => state.apps);

    const [formData, setFormData] = useState({
        appName: '',
        status: 'active',
    });

    useEffect(() => {
        if (app) {
            setFormData({
                appName: app.appName || '',
                status: app.status || 'active',
            });
        }
    }, [app]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (app) {
                await dispatch(updateApp({ id: app._id, data: formData })).unwrap();
            } else {
                await dispatch(addApp(formData)).unwrap();
            }
            onClose();
        } catch (err) {
            // Error is handled in slice and toast in parent
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                            <Layout size={22} />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {app ? 'Edit App' : 'Add New App'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        {/* App Name Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                App Name
                            </label>
                            <input
                                type="text"
                                name="appName"
                                required
                                value={formData.appName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                placeholder="Enter app name"
                            />
                        </div>

                        {/* Status Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                Status
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer font-bold ${formData.status === 'active'
                                        ? 'bg-green-50 border-green-500 text-green-700'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <CheckCircle2 size={18} />
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer font-bold ${formData.status === 'inactive'
                                        ? 'bg-gray-50 border-gray-400 text-gray-700'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <X size={18} />
                                    Inactive
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={appsLoading}
                            className="flex-1 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {appsLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {app ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                app ? 'Update App' : 'Add App'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppModal;
