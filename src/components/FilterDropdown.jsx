import React from 'react';
import { Filter } from 'lucide-react';

export default function FilterDropdown({ 
    value, 
    onChange, 
    options, 
    placeholder = "All Status",
    className = ""
}) {
    return (
        <div className={`relative min-w-[160px] ${className}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 transition-all outline-hidden text-sm font-medium text-gray-700 cursor-pointer shadow-sm"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
    );
}
