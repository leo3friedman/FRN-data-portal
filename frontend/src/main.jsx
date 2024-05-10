import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import '@fontsource-variable/montserrat'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PickupsPage from './pages/PickupsPage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PickupsPage />,
    errorElement: <ErrorPage />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
