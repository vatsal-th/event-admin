export default function StatCard({ icon: Icon, title, value, badge }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                </div>
            </div>
            {badge && (
                <div className="mt-4">
                    <span className="text-xs font-medium text-gray-500">{badge}</span>
                </div>
            )}
        </div>
    );
}
