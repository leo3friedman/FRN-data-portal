import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, LoadingCircle } from '../components/index'
import { Pickup, PageLayout } from '../components/index.js'

import logOutIcon from '../assets/logOutIcon.svg'
import styles from './PickupsPage.module.css'

import { pickupApiErrors } from '../api/enums.js'
import { getPickups } from '../api/index.js'

export default function PickupsPage() {
  const navigate = useNavigate()
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
      <PickupsList />
    </PageLayout>
  )
}

function PickupsList() {
  const navigate = useNavigate()
  const { pickups, pickupsLoading, fetchPickups, pickupsError } = getPickups()

  useEffect(() => {
    fetchPickups()
  }, [])

  useEffect(() => {
    if (pickupsError === pickupApiErrors.NOT_SIGNED_IN) {
      navigate('/login')
    }
  }, [pickupsError])

  if (pickupsLoading) {
    return (
      <div className={styles.loadingCircleContainer}>
        <LoadingCircle />
      </div>
    )
  }

  if (pickupsError) {
    return (
      <div className={styles.error}>
        Error getting pickups. <br /> <br /> Please click <a href='.'>here</a>{' '}
        to try again.
      </div>
    )
  }

  return (
    <ul className={styles.pickupList}>
      {pickups && pickups.length ? (
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
  )
}
