export default function Badge({ status, children }) {
    const variants = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        approved: 'bg-green-100 text-green-800 border-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300',
        active: 'bg-green-100 text-green-800 border-green-300',
        inactive: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${variants[status] || variants.pending}`}>
            {children || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')}
        </span>
    );
}
