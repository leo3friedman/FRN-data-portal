import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import '@fontsource-variable/montserrat'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { pickupsLoader, pickupLoader } from './routes/pickups.js'
import PickupsPage from './pages/PickupsPage.jsx'
import FormPage from './pages/FormPage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PickupsPage />,
    errorElement: <ErrorPage />,
    loader: pickupsLoader,
  },
  {
    path: 'pickups/:pickupId',
    element: <FormPage />,
    errorElement: <ErrorPage />,
    loader: pickupLoader,
  },
  {
    path: 'pickups/new',
    element: <FormPage isNewPickup={true} />,
    errorElement: <ErrorPage />,
    loader: pickupLoader,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
