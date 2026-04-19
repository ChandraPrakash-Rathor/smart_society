import { useEffect, useRef } from 'react'

// Requires: npm install html5-qrcode
// import { Html5QrcodeScanner } from 'html5-qrcode'

function QRScanner({ onScan }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    // Uncomment after installing html5-qrcode:
    // const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 })
    // scanner.render((result) => { onScan(result); scanner.clear() }, console.error)
    // return () => scanner.clear()
  }, [onScan])

  return <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
}

export default QRScanner
