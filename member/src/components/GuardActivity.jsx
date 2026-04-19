const logs = [
  { guard: 'Ramesh Gupta',  checkpoint: 'Gate A',       time: '08:00 AM', status: 'Clear' },
  { guard: 'Suresh Pillai', checkpoint: 'Parking Lot',  time: '09:15 AM', status: 'Alert' },
  { guard: 'Ramesh Gupta',  checkpoint: 'Block B Entry', time: '10:30 AM', status: 'Clear' },
  { guard: 'Vijay Nair',    checkpoint: 'Main Lobby',   time: '11:45 AM', status: 'Clear' },
  { guard: 'Suresh Pillai', checkpoint: 'Gate A',       time: '01:00 PM', status: 'Clear' },
]

function GuardActivity() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Guard Patrol Logs</h2>
        <button className="text-xs text-brand-600 hover:text-brand-800 font-medium transition">View all</button>
      </div>
      <div className="divide-y divide-gray-50">
        {logs.map((l, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-brand-50/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0
                ${l.status === 'Alert' ? 'bg-red-500' : 'bg-green-500'}`} />
              <div>
                <p className="text-sm font-medium text-gray-800">{l.checkpoint}</p>
                <p className="text-xs text-gray-400">{l.guard}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600">{l.time}</p>
              <span className={`text-xs font-semibold ${l.status === 'Alert' ? 'text-red-500' : 'text-green-600'}`}>
                {l.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GuardActivity
