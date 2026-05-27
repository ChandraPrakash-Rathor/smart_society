import Modal from '../Modal'

// Generic confirm modal — used for Allow / Reject actions
export default function ConfirmModal({ open, onClose, onConfirm, type = 'approve', visitor }) {
  if (!visitor) return null

  const isApprove = type === 'approve'

  return (
    <Modal open={open} onClose={onClose} title={isApprove ? 'Allow Entry' : 'Reject Entry'} size="sm">
      <div className="flex flex-col items-center text-center gap-4">

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
          ${isApprove ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {isApprove ? (
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Message */}
        <div>
          <p className="text-base font-bold text-brand-950">
            {isApprove ? 'Allow this visitor?' : 'Reject this visitor?'}
          </p>
          <p className="text-sm text-brand-400 mt-1">
            <span className="font-semibold text-brand-700">{visitor.name}</span>
            {' '}— Flat <span className="font-semibold text-brand-700">{visitor.flat}</span>
          </p>
          <p className="text-xs text-brand-400 mt-0.5">{visitor.phone}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose() }}
            className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition active:scale-95 shadow-md
              ${isApprove
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}>
            {isApprove ? 'Yes, Allow' : 'Yes, Reject'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
