import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface">
      <h1 className="text-6xl font-extrabold text-primary mb-2">404</h1>
      <p className="text-navy/60 mb-6">This page took a wrong turn and couldn't find a spot.</p>
      <Link to="/"><Button>Back to Home</Button></Link>
    </div>
  )
}
