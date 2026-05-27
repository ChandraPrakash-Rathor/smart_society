import { ClipboardCheck, PhoneCall, QrCode, ShieldAlert, Siren, MapPin } from 'lucide-react'

const checklist = [
  { title: 'Verify every QR pass', text: 'Scan visitor QR and confirm name, flat, phone, and approval status.', icon: QrCode },
  { title: 'Record entry and exit', text: 'Every visitor must have entry time and exit time before leaving.', icon: ClipboardCheck },
  { title: 'Watch emergency alerts', text: 'Keep emergency alert panel open during duty hours.', icon: Siren },
  { title: 'Escalate suspicious activity', text: 'Reject unknown visitors and inform admin immediately.', icon: ShieldAlert },
]

const contacts = [
  { label: 'Admin Office', value: '+91 90000 00001' },
  { label: 'Main Gate', value: '+91 90000 00002' },
  { label: 'Emergency Desk', value: '+91 90000 00003' },
]

export default function GuardDutyGuide() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Duty Guide</h1>
        <p className="mt-1 text-sm text-brand-400">Important guard instructions and quick contacts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-brand-950">Shift Checklist</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {checklist.map(item => (
              <div key={item.title} className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600">
                  <item.icon size={18} />
                </div>
                <p className="font-bold text-brand-950">{item.title}</p>
                <p className="mt-1 text-sm text-brand-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <PhoneCall size={16} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-brand-950">Quick Contacts</h2>
          </div>
          <div className="space-y-3">
            {contacts.map(contact => (
              <a key={contact.label} href={`tel:${contact.value.replace(/\s/g, '')}`}
                className="block rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 transition hover:border-emerald-300">
                <p className="text-sm font-bold text-emerald-800">{contact.label}</p>
                <p className="mt-0.5 text-xs text-emerald-700">{contact.value}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold text-amber-800">Gate Rule</p>
            <p className="mt-1 text-sm text-amber-700">
              Do not allow entry without resident approval, valid QR pass, or admin confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
