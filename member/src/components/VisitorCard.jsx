function VisitorCard({ visitor }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' }}>
      <p><strong>Name:</strong> {visitor.name}</p>
      <p><strong>Host:</strong> {visitor.host}</p>
      <p><strong>Status:</strong> {visitor.status}</p>
      <p><strong>Check-in:</strong> {visitor.checkIn || 'Pending'}</p>
    </div>
  )
}

export default VisitorCard
