import { createBrowserRouter } from 'react-router-dom'

import PublicLayout from '../components/layout/PublicLayout'
import LandingPage from '../features/landing/LandingPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
])

export default router