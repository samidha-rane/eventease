import { Route, Routes } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Events from '@/pages/Events'
import EventDetail from '@/pages/EventDetail'
import MyRegistrations from '@/pages/MyRegistrations'
import HowItWorks from '@/pages/HowItWorks'
import Soon from '@/pages/Soon'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="how-it-works" element={<HowItWorks />} />

        <Route element={<ProtectedRoute />}>
          <Route path="my-registrations" element={<MyRegistrations />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="admin" element={<Soon title="Admin dashboard" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}