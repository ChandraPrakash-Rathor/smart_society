import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const [scanning, setScanning]   = useState(false)
  const [error, setError]         = useState(null)
  const [result, setResult]       = useState(null)  // parsed visitor data

  const SCANNER_ID = 'qr-reader'

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        // Stop scanning after first successful scan
        scanner.stop().catch(() => {})
        setScanning(false)

        try {
          const data = JSON.parse(decodedText)
          setResult(data)
          onScan?.(data)
        } catch {
          // Not JSON — treat as plain text
          setResult({ name: decodedText, raw: true })
          onScan?.({ name: decodedText, raw: true })
        }
      },
      () => {} // ignore frame errors
    )
    .then(() => setScanning(true))
    .catch(err => setError('Camera access denied. Please allow camera permission.'))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">

      {/* Scanner viewport */}
      {!result && (
        <div className="relative">
          <div id={SCANNER_ID} className="rounded-2xl overflow-hidden" />
          {scanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 border-2 border-brand-500 rounded-2xl relative">
                {/* Corner markers */}
                {['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'].map((pos, i) => (
                  <div key={i} className={`absolute w-5 h-5 border-brand-500 ${pos}
                    ${i < 2 ? 'border-t-2' : 'border-b-2'}
                    ${i % 2 === 0 ? 'border-l-2' : 'border-r-2'}`} />
                ))}
                {/* Scan line animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-brand-500/60 animate-[scanLine_2s_ease-in-out_infinite]" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Scan result */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <p className="font-bold text-emerald-800">QR Scanned Successfully!</p>
          </div>

          {!result.raw ? (
            <div className="space-y-2">
              {[
                { label: 'Name',    value: result.name    },
                { label: 'Phone',   value: result.phone   },
                { label: 'Host',    value: result.host    },
                { label: 'Purpose', value: result.purpose },
                { label: 'Status',  value: result.status  },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 font-medium">{label}</span>
                  <span className="font-semibold text-emerald-900">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-700">{result.name}</p>
          )}

          {/* Status badge */}
          {result.status && (
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full
              ${result.status === 'Approved' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-700'}`}>
              {result.status === 'Approved' ? '✅ Entry Allowed' : '⚠️ Not Approved'}
            </div>
          )}
        </div>
      )}

      {/* Scanning status */}
      {scanning && !result && (
        <p className="text-xs text-brand-400 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          Point camera at visitor QR code
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {result && (
          <button onClick={() => { setResult(null); setScanning(false) }}
            className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Scan Another
          </button>
        )}
        <button onClick={onClose}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition">
          {result ? 'Done' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}
