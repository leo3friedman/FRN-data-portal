import { useLoaderData, useNavigate } from 'react-router-dom'
import { Button } from '../components/index'
import { Pickup, PageLayout } from '../components/index.js'
import logOutIcon from '../assets/logOutIcon.svg'
import styles from './PickupsPage.module.css'

export default function PickupsPage() {
  const pickups = useLoaderData()
  const navigate = useNavigate()

  return (
    <PageLayout>
      <div className={styles.stickyContent}>
        <nav className={styles.logout} onClick={() => navigate('/login')}>
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
        {pickups.map((pickup) => (
          <li key={pickup?.id}>
            <Pickup
              pickupId={pickup?.id}
              pickupDate={pickup?.pickupDate}
              donorAgency={pickup?.donorAgency}
            />
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}
