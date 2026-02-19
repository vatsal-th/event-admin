import React from 'react';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = ({ message = "You don't have permission to access this page." }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 max-w-md mb-8">
                {message} Please contact your administrator if you believe this is a mistake.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-100 cursor-pointer"
                >
                    <Home size={18} />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;
