import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, LoadingCircle } from '../components/index'
import { Pickup, PageLayout } from '../components/index.js'
import logOutIcon from '../assets/logOutIcon.svg'
import styles from './PickupsPage.module.css'

export default function PickupsPage() {
  const navigate = useNavigate()
  const [pickups, setPickups] = useState([])
  const [pickupsLoading, setPickupsLoading] = useState(true)

  async function logout() {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        navigate('/login')
      } else {
        throw new Error()
      }
    } catch (error) {
      console.log(error)
      alert(
        'Sorry, we are having some trouble logging you out. Please try again later.'
      )
    }
  }

  async function loadPickups() {
    try {
      setPickupsLoading(true)
      const response = await fetch('http://localhost:3000/pickups', {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login')
        }
      }
      const result = await response.json()
      setPickups(result)
    } catch (error) {
      console.log(error)
    } finally {
      setPickupsLoading(false)
    }
  }

  useEffect(() => {
    loadPickups()
  }, [])

  return (
    <PageLayout>
      <div className={styles.stickyContent}>
        <nav className={styles.logout} onClick={logout}>
          <img src={logOutIcon} />
          Logout
        </nav>
        <header className={styles.pageHeader}>
          Pickups
          <Button size='small' onClick={() => navigate('/pickups/new')}>
            New Pickup
          </Button>
        </header>
      </div>

      <ul className={styles.pickupList}>
        {pickupsLoading ? (
          <LoadingCircle />
        ) : pickups && pickups.length ? (
          pickups.map((pickup) => (
            <li key={pickup?.id}>
              <Pickup
                pickupId={pickup?.id}
                pickupDate={pickup?.pickupDate}
                donorAgency={pickup?.donorAgency}
              />
            </li>
          ))
        ) : (
          <div>No pickups found</div>
        )}
      </ul>
    </PageLayout>
  )
}
