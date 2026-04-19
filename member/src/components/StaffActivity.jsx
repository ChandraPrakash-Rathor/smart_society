const staff = [
  { name: 'Anjali Desai',   role: 'Manager',    checkIn: '08:55 AM', checkOut: null,      status: 'In' },
  { name: 'Rohit Kumar',    role: 'Developer',  checkIn: '09:10 AM', checkOut: null,      status: 'In' },
  { name: 'Meena Joshi',    role: 'HR',         checkIn: '09:00 AM', checkOut: '05:00 PM',status: 'Out' },
  { name: 'Suresh Pillai',  role: 'Security',   checkIn: '08:00 AM', checkOut: null,      status: 'In' },
  { name: 'Kavita Rao',     role: 'Accountant', checkIn: '09:30 AM', checkOut: '04:30 PM',status: 'Out' },
]

function StaffActivity() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Staff Activity</h2>
        <button className="text-xs text-brand-600 hover:text-brand-800 font-medium transition">View all</button>
      </div>
      <div className="divide-y divide-gray-50">
        {staff.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-brand-50/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                {s.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-400">{s.role}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1
                ${s.status === 'In' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.status === 'In' ? 'Checked In' : 'Checked Out'}
              </span>
              <p className="text-xs text-gray-400">
                {s.status === 'In' ? `In: ${s.checkIn}` : `Out: ${s.checkOut}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StaffActivity
