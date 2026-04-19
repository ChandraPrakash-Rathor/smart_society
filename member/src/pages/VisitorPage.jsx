import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setVisitors } from '../features/visitor/visitorSlice'
import VisitorCard from '../components/VisitorCard'
import Navbar from '../components/Navbar'
import api from '../api/axios'

function VisitorPage() {
  const dispatch = useDispatch()
  const { visitors } = useSelector((state) => state.visitor)

  useEffect(() => {
    api.get('/visitors')
      .then(({ data }) => dispatch(setVisitors(data)))
      .catch(console.error)
  }, [dispatch])

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h2>Visitors</h2>
        {visitors.length === 0
          ? <p>No visitors found.</p>
          : visitors.map((v) => <VisitorCard key={v._id} visitor={v} />)
        }
      </div>
    </div>
  )
}

export default VisitorPage
