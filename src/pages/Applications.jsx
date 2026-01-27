import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { mockApplications } from '../data/mockData';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Applications() {
    const [activeTab, setActiveTab] = useState('event-hosting');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const tabs = [
        { id: 'event-hosting', label: 'Event Hosting Applications' },
        { id: 'apply-event', label: 'Apply Event Applications' },
        { id: 'agency', label: 'Agency Applications' },
        { id: 'influencer', label: 'Influencer Applications' }
    ];

    const filteredApplications = mockApplications.filter(
        app => app.category === activeTab
    );

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleReject = () => {
        console.log('Rejected');
        toast.error('Application rejected');
        setIsModalOpen(false);
        setSelectedApplication(null);
    };

    const handleApprove = async () => {
        setIsProcessing(true);

        // Simulate API call with 2 second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        toast.success('Application Approved! Reward of ₹850 credited to user wallet.', {
            duration: 4000,
            icon: '✅'
        });
        setIsModalOpen(false);
        setSelectedApplication(null);
    };

    const columns = [
        {
            header: 'User Name',
            accessor: 'userName',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <img
                        src={row.avatar}
                        alt={row.userName}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{row.userName}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Applied Date',
            accessor: 'appliedDate',
            render: (row) => {
                const date = new Date(row.appliedDate);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <Badge status={row.status} />
        },
        {
            header: 'Action',
            render: (row) => (
                <button
                    onClick={() => handleViewDetails(row)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                    <Eye className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
                <p className="text-gray-600 mt-2">Review and manage user applications</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4 lg:gap-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 font-medium text-sm transition-all duration-200 border-b-2 cursor-pointer whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} data={filteredApplications} />

            {/* Application Detail Modal */}
            {selectedApplication && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                    }}
                    title="Application Details"
                    size="lg"
                >
                    <div className="space-y-6">
                        {/* User Info */}
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                            <img
                                src={selectedApplication.avatar}
                                alt={selectedApplication.userName}
                                className="w-16 h-16 rounded-full"
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedApplication.userName}
                                </h3>
                                <p className="text-sm text-gray-600">{selectedApplication.email}</p>
                                <div className="mt-2">
                                    <Badge status={selectedApplication.status} />
                                </div>
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Applied Date</p>
                                <p className="text-base text-gray-900 mt-1">
                                    {new Date(selectedApplication.appliedDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Category</p>
                                <p className="text-base text-gray-900 mt-1 capitalize">
                                    {selectedApplication.category.replace('-', ' ')}
                                </p>
                            </div>
                        </div>

                        {/* Category-specific details */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h4 className="font-semibold text-gray-900">Additional Information</h4>
                            {Object.entries(selectedApplication.details).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-sm font-medium text-gray-500 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <p className="text-sm text-gray-900 mt-1">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        {selectedApplication.status === 'pending' && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Reject Application
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Approve Application'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
