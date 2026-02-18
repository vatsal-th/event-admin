import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange 
}) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalItems <= 0) return null;

    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{startItem}</span> to <span className="font-bold text-gray-900">{endItem}</span> of <span className="font-bold text-gray-900">{totalItems}</span> records
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
                >
                    <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
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
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
