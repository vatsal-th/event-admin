export default function Table({ columns, data, onRowAction }) {
    return (
        <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {!Array.isArray(data) || data.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        No data available
                    </div>
                ) : (
                    data.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            onClick={() => onRowAction && onRowAction(row)}
                        >
                            {columns.map((column, colIndex) => (
                                <div key={colIndex} className="flex justify-between items-center py-2">
                                    <span className="text-sm font-medium text-gray-600">{column.header}:</span>
                                    <div className="text-sm text-gray-900">
                                        {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {!Array.isArray(data) || data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    onClick={() => onRowAction && onRowAction(row)}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                                            {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
