import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Upload, 
    Download, 
    Trash2, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    FileText, 
    AlertCircle, 
    CheckCircle2,
    X
} from 'lucide-react';
import { 
    fetchSalaryRecords, 
    uploadSalaryCsvAction, 
    clearSalaryRecordsAction, 
    clearMessages 
} from '../store/slices/salarySlice';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

export default function SalaryManagement() {
    const dispatch = useDispatch();
    const { records, pagination, loading, uploading, clearing, error, success } = useSelector((state) => state.salary);
    
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const loadData = useCallback(() => {
        dispatch(fetchSalaryRecords({ 
            page: currentPage, 
            limit: 20, 
            search: searchTerm 
        }));
    }, [dispatch, currentPage, searchTerm]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearMessages());
        }
        if (success) {
            toast.success(success);
            dispatch(clearMessages());
            loadData();
            setFile(null);
        }
    }, [error, success, dispatch, loadData]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast.error('Only CSV files allowed');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a CSV file first');
            return;
        }
        dispatch(uploadSalaryCsvAction(file));
    };

    const handleClearAll = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        dispatch(clearSalaryRecordsAction());
        setIsDeleteModalOpen(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
                toast.error('Only CSV files allowed');
                return;
            }
            setFile(droppedFile);
        }
    };

    const columns = [
        { header: 'Talent ID', key: 'talentId' },
        { header: 'Nickname', key: 'nickname' },
        { header: 'Duration', key: 'duration' },
        { header: 'Valid Day', key: 'validDay' },
        { header: 'Actual Ear', key: 'actualEar' },
        { header: 'New Tale', key: 'newTale' },
        { header: 'Crown', key: 'crown' },
        { header: 'Lev', key: 'lev' },
        { header: 'Revenue', key: 'revenue' },
        { header: 'Total Beni', key: 'totalBeni' },
        { header: 'Gems Bal', key: 'gemsBal' },
        { header: 'Gem Valu', key: 'gemValu' },
        { header: 'Gem Refu', key: 'gemRefu' },
        { header: 'Gem exch', key: 'gemExch' },
        { header: 'Gem cash', key: 'gemCash' },
        { header: 'Basic Sala', key: 'basicSala' },
        { header: 'Revenue I', key: 'revenueI' },
        { header: 'INR Salary', key: 'inrSalary' },
        { header: 'cardit ded', key: 'carditDed' },
        { header: 'total pay', key: 'totalPay' },
        { header: 'Join Date', key: 'joinDate' },
        { header: 'Country', key: 'country' },
        { header: 'Talent Lev', key: 'talentLev' },
        { header: 'Agency ID', key: 'agencyId' },
        { header: 'Excellent', key: 'excellent' },
        { header: 'Payment', key: 'payment' },
        { header: 'Bank Nam', key: 'bankNam' },
        { header: 'Bank Acco', key: 'bankAcco' },
        { header: 'ifc code', key: 'ifcCode' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Status', key: 'status' },
        { header: 'pancard', key: 'pancard' },
        { header: 'Manager', key: 'manager' },
        { header: 'Remark', key: 'remark' }
    ];

    return (
        <> 
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
                    <p className="text-gray-600 mt-1">Upload and manage user salary records via CSV</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClearAll}
                        disabled={clearing || loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold border border-red-100 cursor-pointer disabled:opacity-50"
                    >
                        {clearing ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={18} />}
                        Clear All Records
                    </button>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex-1 w-full border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
                            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                        }`}
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Upload size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">
                                {file ? file.name : 'Drag & drop CSV file here'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {file ? `${(file.size / 1024).toFixed(2)} KB` : 'or click to browse from your computer'}
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all cursor-pointer font-medium"
                        >
                            Select File
                        </label>
                    </div>

                    <div className="w-full lg:w-72 flex flex-col gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                                <FileText size={16} /> CSV Format Info
                            </h4>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Ensure headers match: Talent ID, Nickname, Duration, INR Salary, Bank Details, Status, etc. (35 columns total)
                            </p>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                !file || uploading 
                                    ? 'bg-gray-100 text-gray-400' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                            }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    Import Salary
                                </>
                            )}
                        </button>
                    </div>
                </div>
                {uploading && (
                    <div className="mt-6 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full animate-pulse w-full"></div>
                    </div>
                )}
            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Salary Records</h2>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by Talent ID or Nickname..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all underline-offset-4"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                {columns.map((col) => (
                                    <th key={col.key} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-100">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && records.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {columns.map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : records.length > 0 ? (
                                records.map((record, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                {col.key === 'status' ? (
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                        record[col.key]?.toLowerCase() === 'paid' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {record[col.key] || 'N/A'}
                                                    </span>
                                                ) : col.key === 'inrSalary' || col.key === 'totalPay' ? (
                                                    <span className="font-bold text-gray-900 text-nowrap">
                                                        ₹{record[col.key]?.toLocaleString() || 0}
                                                    </span>
                                                ) : (
                                                    record[col.key] || 'N/A'
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                <FileText size={32} />
                                            </div>
                                            <p className="text-gray-500 font-medium">No records found</p>
                                            <p className="text-sm text-gray-400">Import a CSV file to see salary data here</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {records.length > 0 && (
                    <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900">{((currentPage - 1) * 20) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * 20, pagination.total)}</span> of <span className="font-bold text-gray-900">{pagination.total}</span> records
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || loading}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                let pageNum;
                                if (pagination.pages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                                            currentPage === pageNum
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                disabled={currentPage === pagination.pages || loading}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
            

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Clear All Records"
                size="sm"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-900">Warning: Irreversible Action</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Are you sure you want to clear ALL salary records? This action cannot be undone and will permanently remove all imported data.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={clearing}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2"
                        >
                            {clearing ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={16} />}
                            Yes, Clear All
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
        </>
    );
}
