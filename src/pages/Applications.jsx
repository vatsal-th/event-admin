import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Loader2, CheckCircle2, XCircle, User, Phone, Globe, Tag, Info, Layout, Calendar, Clock, DollarSign, Fingerprint, Instagram, Share2, Users } from 'lucide-react';
import { fetchHostingApplications, updateHostingApplicationStatus, clearMessages as clearHostingMessages } from '../store/slices/hostingApplicationSlice';
import { fetchEventApplications, updateEventApplicationStatus, clearMessages as clearEventMessages } from '../store/slices/eventApplicationSlice';
import { fetchAgencyApplications, updateAgencyApplicationStatus, clearMessages as clearAgencyMessages } from '../store/slices/agencyApplicationSlice';
import { fetchInfluencerApplications, updateInfluencerApplicationStatus, clearMessages as clearInfluencerMessages } from '../store/slices/influencerApplicationSlice';
import { mockApplications } from '../data/mockData';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Applications() {
    const dispatch = useDispatch();
    const { applications: hostingApps, loading: hostingLoading, error: hostingError, success: hostingSuccess } = useSelector((state) => state.hostingApplications);
    const { applications: eventApps, loading: eventLoading, error: eventError, success: eventSuccess } = useSelector((state) => state.eventApplications);
    const { applications: agencyApps, loading: agencyLoading, error: agencyError, success: agencySuccess } = useSelector((state) => state.agencyApplications);
    const { applications: influencerApps, loading: influencerLoading, error: influencerError, success: influencerSuccess } = useSelector((state) => state.influencerApplications);

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('event-hosting');

    const tabs = [
        { id: 'event-hosting', label: 'Event Hosting' },
        { id: 'apply-event', label: 'Apply Event' },
        { id: 'agency', label: 'Agency' },
        { id: 'influencer', label: 'Influencer' }
    ];

    useEffect(() => {
        if (activeTab === 'event-hosting') {
            dispatch(fetchHostingApplications());
        } else if (activeTab === 'apply-event') {
            dispatch(fetchEventApplications());
        } else if (activeTab === 'agency') {
            dispatch(fetchAgencyApplications());
        } else if (activeTab === 'influencer') {
            dispatch(fetchInfluencerApplications());
        }
    }, [dispatch, activeTab]);

    useEffect(() => {
        if (hostingError) {
            toast.error(hostingError);
            dispatch(clearHostingMessages());
        }
        if (hostingSuccess) {
            toast.success(hostingSuccess);
            dispatch(clearHostingMessages());
        }
    }, [hostingError, hostingSuccess, dispatch]);

    useEffect(() => {
        if (eventError) {
            toast.error(eventError);
            dispatch(clearEventMessages());
        }
        if (eventSuccess) {
            toast.success(eventSuccess);
            dispatch(clearEventMessages());
        }
    }, [eventError, eventSuccess, dispatch]);

    useEffect(() => {
        if (agencyError) {
            toast.error(agencyError);
            dispatch(clearAgencyMessages());
        }
        if (agencySuccess) {
            toast.success(agencySuccess);
            dispatch(clearAgencyMessages());
        }
    }, [agencyError, agencySuccess, dispatch]);

    useEffect(() => {
        if (influencerError) {
            toast.error(influencerError);
            dispatch(clearInfluencerMessages());
        }
        if (influencerSuccess) {
            toast.success(influencerSuccess);
            dispatch(clearInfluencerMessages());
        }
    }, [influencerError, influencerSuccess, dispatch]);

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (id, status) => {
        setIsProcessing(true);
        try {
            if (activeTab === 'event-hosting') {
                await dispatch(updateHostingApplicationStatus({ id, status })).unwrap();
            } else if (activeTab === 'apply-event') {
                await dispatch(updateEventApplicationStatus({ id, status })).unwrap();
            } else if (activeTab === 'agency') {
                await dispatch(updateAgencyApplicationStatus({ id, status })).unwrap();
            } else if (activeTab === 'influencer') {
                await dispatch(updateInfluencerApplicationStatus({ id, status })).unwrap();
            }
            setIsModalOpen(false);
            setSelectedApplication(null);
        } catch (err) {
            // Error is handled by useEffect
        } finally {
            setIsProcessing(false);
        }
    };

    const displayApplications = useMemo(() => {
        switch (activeTab) {
            case 'event-hosting': return hostingApps;
            case 'apply-event': return eventApps;
            case 'agency': return agencyApps;
            case 'influencer': return influencerApps;
            default: return mockApplications.filter(app => app.category === activeTab);
        }
    }, [activeTab, hostingApps, eventApps, agencyApps]);

    const isLoading = useMemo(() => {
        switch (activeTab) {
            case 'event-hosting': return hostingLoading;
            case 'apply-event': return eventLoading;
            case 'agency': return agencyLoading;
            case 'influencer': return influencerLoading;
            default: return false;
        }
    }, [activeTab, hostingLoading, eventLoading, agencyLoading]);

    const columns = useMemo(() => {
        if (activeTab === 'event-hosting') {
            return [
                {
                    header: 'User Name',
                    render: (row) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {row.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{row.fullName}</p>
                                <p className="text-xs text-gray-500">{row.mobileNumber}</p>
                            </div>
                        </div>
                    )
                },
                {
                    header: 'Talent / App',
                    render: (row) => (
                        <div>
                            <p className="text-sm font-medium text-gray-900">{row.talent}</p>
                            <p className="text-xs text-gray-500">{row.appId?.appName || 'N/A'}</p>
                        </div>
                    )
                },
                {
                    header: 'Country',
                    render: (row) => (
                        <div className="flex items-center gap-2">
                            <Globe size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{row.countryId?.name || 'N/A'}</span>
                        </div>
                    )
                },
                {
                    header: 'Status',
                    render: (row) => <Badge status={row.status.toLowerCase()} />
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
        }

        if (activeTab === 'apply-event') {
            return [
                {
                    header: 'User Name',
                    render: (row) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                {row.fullName?.charAt(0) || <Phone size={18} />}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{row.fullName || row.mobileNumber}</p>
                                <p className="text-xs text-gray-500">{row.mobileNumber}</p>
                            </div>
                        </div>
                    )
                },
                {
                    header: 'Budget / Agency',
                    render: (row) => (
                        <div>
                            <p className="text-sm font-medium text-gray-900">{row.budget}</p>
                            <p className="text-xs text-gray-500">Code: {row.agencyCode}</p>
                        </div>
                    )
                },
                {
                    header: 'Event Date/Time',
                    render: (row) => (
                        <div>
                            <p className="text-sm text-gray-900 flex items-center gap-1">
                                <Calendar size={12} className="text-gray-400" /> {row.eventDate}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} className="text-gray-400" /> {row.eventTime}
                            </p>
                        </div>
                    )
                },
                {
                    header: 'Status',
                    render: (row) => <Badge status={row.status.toLowerCase()} />
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
        }

        if (activeTab === 'agency') {
            return [
                {
                    header: 'Agency Details',
                    render: (row) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                {row.agencyName?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{row.agencyName}</p>
                                <p className="text-xs text-gray-500">Owner: {row.fullName}</p>
                            </div>
                        </div>
                    )
                },
                {
                    header: 'App / Hosts',
                    render: (row) => (
                        <div>
                            <p className="text-sm font-medium text-gray-900">{row.appId?.appName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{row.minHostRequirement}</p>
                        </div>
                    )
                },
                {
                    header: 'Contact',
                    render: (row) => (
                        <div className="space-y-1">
                            <p className="text-sm text-gray-900 flex items-center gap-1">
                                <Phone size={12} className="text-gray-400" /> {row.mobileNumber}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Globe size={12} className="text-gray-400" /> {row.countryId?.name || 'N/A'}
                            </p>
                        </div>
                    )
                },
                {
                    header: 'Status',
                    render: (row) => <Badge status={row.status.toLowerCase()} />
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
        }

        if (activeTab === 'influencer') {
            return [
                {
                    header: 'Influencer Name',
                    render: (row) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                                {row.fullName?.charAt(0) || <User size={18} />}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{row.fullName}</p>
                                <p className="text-xs text-gray-500">{row.gender}</p>
                            </div>
                        </div>
                    )
                },
                {
                    header: 'Social Media',
                    render: (row) => (
                        <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <Instagram size={14} className="text-pink-500" /> {row.socialMediaId}
                            </p>
                            <p className="text-xs text-gray-500">{row.instagramFollowers} Followers</p>
                        </div>
                    )
                },
                {
                    header: 'Contact',
                    render: (row) => (
                        <div className="space-y-1">
                            <p className="text-sm text-gray-900 flex items-center gap-1">
                                <Phone size={12} className="text-gray-400" /> {row.whatsAppNumber}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Globe size={12} className="text-gray-400" /> {row.countryId?.name || 'N/A'}
                            </p>
                        </div>
                    )
                },
                {
                    header: 'Status',
                    render: (row) => <Badge status={row.status.toLowerCase()} />
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
        }

        // Default columns for other categories (using mock data structure)
        return [
            {
                header: 'User Name',
                accessor: 'userName',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <img src={row.avatar} alt={row.userName} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-medium text-gray-900">{row.userName}</p>
                            <p className="text-xs text-gray-500">{row.email}</p>
                        </div>
                    </div>
                )
            },
            {
                header: 'Applied Date',
                render: (row) => (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(row.appliedDate).toLocaleDateString()}
                    </div>
                )
            },
            {
                header: 'Status',
                render: (row) => <Badge status={row.status.toLowerCase()} />
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
    }, [activeTab]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
                <p className="text-gray-600 mt-2">Review and manage user applications across different categories</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && displayApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="mt-4 text-gray-500 font-medium">Loading applications...</p>
                </div>
            ) : (
                <Table columns={columns} data={displayApplications} />
            )}

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
                        {/* Hosting Application View (Real Data) */}
                        {activeTab === 'event-hosting' ? (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100">
                                        {selectedApplication.fullName?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedApplication.fullName}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <Badge status={selectedApplication.status.toLowerCase()} />
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Phone size={14} /> {selectedApplication.mobileNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Info</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Layout size={16} /> Target App</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.appId?.appName || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Globe size={16} /> Country</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.countryId?.name || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Other Details</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Tag size={16} /> Talent</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.talent}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><User size={16} /> Inviter ID</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.inviterId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'apply-event' ? (
                            /* Event Application View (Real Data) */
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-100">
                                        {selectedApplication.fullName?.charAt(0) || <Phone size={32} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedApplication.fullName || selectedApplication.mobileNumber}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <Badge status={selectedApplication.status.toLowerCase()} />
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Phone size={14} /> {selectedApplication.mobileNumber}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <User size={14} /> {selectedApplication.gender}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Event Schedule</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={16} /> Date</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.eventDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Clock size={16} /> Time</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.eventTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Financial & IDs</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><DollarSign size={16} /> Budget</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.budget}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Tag size={16} /> Agency Code</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.agencyCode}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Opponents</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-1">Your ID</span>
                                                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                    <Fingerprint size={14} className="text-gray-400" />
                                                    {selectedApplication.yourId || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-1">Opponent ID</span>
                                                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                    <Fingerprint size={14} className="text-gray-400" />
                                                    {selectedApplication.opponentId || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'agency' ? (
                            /* Agency Application View (Real Data) */
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-100">
                                        {selectedApplication.agencyName?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedApplication.agencyName}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <Badge status={selectedApplication.status.toLowerCase()} />
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <User size={14} /> {selectedApplication.fullName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Agency Specs</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Layout size={16} /> App Name</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.appId?.appName || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Users size={16} /> Requirements</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.minHostRequirement}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Owner Info</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Phone size={16} /> Mobile</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.mobileNumber}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Globe size={16} /> Country</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.countryId?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Tag size={16} /> Inviter ID</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.inviterId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'influencer' ? (
                            /* Influencer Application View (Real Data) */
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-pink-100">
                                        {selectedApplication.fullName?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedApplication.fullName}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <Badge status={selectedApplication.status.toLowerCase()} />
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Instagram size={14} /> {selectedApplication.socialMediaId}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <User size={14} /> {selectedApplication.gender}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Social Stats</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Users size={16} /> Followers</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.instagramFollowers}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Share2 size={16} /> Profile Link</span>
                                                <a href={`https://${selectedApplication.instagramLink}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                                                    {selectedApplication.instagramLink}
                                                </a>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><CheckCircle2 size={16} /> Verified</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.verificationStatus}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal Info</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Phone size={16} /> WhatsApp</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.whatsAppNumber}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Globe size={16} /> Country</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.countryId?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={16} /> Entry Date</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedApplication.entryDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Placeholder for other categories */
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                                    <img src={selectedApplication.avatar} className="w-16 h-16 rounded-full" />
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedApplication.userName}</h3>
                                        <p className="text-sm text-gray-600">{selectedApplication.email}</p>
                                        <div className="mt-2 text-nowrap"><Badge status={selectedApplication.status.toLowerCase()} /></div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                    {Object.entries(selectedApplication.details).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-0">
                                            <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="text-sm font-medium text-gray-900">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions for Real API Data */}
                        {(activeTab === 'event-hosting' || activeTab === 'apply-event' || activeTab === 'agency' || activeTab === 'influencer') && selectedApplication.status.toLowerCase() === 'pending' && (
                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => handleStatusUpdate(selectedApplication._id, 'Rejected')}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3.5 bg-red-50 text-red-700 rounded-2xl hover:bg-red-100 transition-all font-bold cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <XCircle size={20} /> Reject
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedApplication._id, 'Approved')}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-lg transition-all font-bold cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />} Approve
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
