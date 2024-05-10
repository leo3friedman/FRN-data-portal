import { Button } from '../components/index'
import pickups from '../assets/sampleData.json'
import { Pickup, PageLayout } from '../components/index.js'
import styles from './PickupsPage.module.css'

export default function PickupsPage() {
  return (
    <PageLayout>
      <header className={styles.pageHeader}>
        Pickups <Button size='small'>New Pickup</Button>
      </header>
      <ul className={styles.pickupList}>
        {pickups.map((pickup) => (
          <li>
            <Pickup
              pickupDate={pickup['Pickup Date']}
              donorAgency={pickup['Donor Agency']}
            />
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}
