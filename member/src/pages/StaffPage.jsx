import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStaff } from '../features/staff/staffSlice'
import Navbar from '../components/Navbar'
import api from '../api/axios'

function StaffPage() {
  const dispatch = useDispatch()
  const { staffList } = useSelector((state) => state.staff)

  useEffect(() => {
    api.get('/staff')
      .then(({ data }) => dispatch(setStaff(data)))
      .catch(console.error)
  }, [dispatch])

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h2>Staff</h2>
        {staffList.length === 0
          ? <p>No staff found.</p>
          : staffList.map((s) => (
            <div key={s._id} style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <p><strong>{s.name}</strong> — {s.role}</p>
              <p>{s.email}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default StaffPage
