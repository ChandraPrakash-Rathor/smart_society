const visitors = [
  { name: 'Rahul Sharma',   purpose: 'Meeting',    time: '09:15 AM', status: 'Approved' },
  { name: 'Priya Mehta',    purpose: 'Delivery',   time: '10:02 AM', status: 'Pending'  },
  { name: 'Amit Verma',     purpose: 'Interview',  time: '10:45 AM', status: 'Approved' },
  { name: 'Sneha Patil',    purpose: 'Personal',   time: '11:30 AM', status: 'Rejected' },
  { name: 'Karan Singh',    purpose: 'Maintenance',time: '12:10 PM', status: 'Approved' },
  { name: 'Divya Nair',     purpose: 'Meeting',    time: '01:00 PM', status: 'Pending'  },
]

const badge = {
  Approved: 'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-600',
}

function VisitorTable() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Recent Visitors</h2>
        <button className="text-xs text-brand-600 hover:text-brand-800 font-medium transition">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">Purpose</th>
              <th className="px-6 py-3 text-left font-medium">Entry Time</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visitors.map((v, i) => (
              <tr key={i} className="hover:bg-brand-50/40 transition-colors">
                <td className="px-6 py-3.5 font-medium text-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                      {v.name[0]}
                    </div>
                    {v.name}
                  </div>
                </td>
                <td className="px-6 py-3.5 text-gray-500">{v.purpose}</td>
                <td className="px-6 py-3.5 text-gray-500">{v.time}</td>
                <td className="px-6 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge[v.status]}`}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VisitorTable
