import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, LoadingCircle } from '../components/index'
import { Pickup, PageLayout } from '../components/index.js'
import searchIcon from '../assets/searchIcon.svg'
import styles from './PickupsPage.module.css'
import { pickupApiErrors } from '../hooks/enums.js'
import { useGetPickups } from '../hooks/index.js'

export default function PickupsPage() {
  const navigate = useNavigate()
  const { pickups, pickupsLoading, fetchPickups, pickupsError } =
    useGetPickups()
  const [filteredPickups, setFilteredPickups] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPickups()
  }, [])

  function isInQuery(pickup) {
    const { pickupDate, donorAgency } = pickup
    const queryInDate =
      pickupDate &&
      pickupDate.toLowerCase().includes(String(searchQuery).toLowerCase())
    const queryInAgency =
      donorAgency &&
      donorAgency.toLowerCase().includes(String(searchQuery).toLowerCase())
    return queryInDate || queryInAgency
  }

  /**
   *
   * @param {Object} pickupA
   * @param {Object} pickupB
   * @returns 1 if pickupA < pickupB, -1 if pickupA > pickupB, 0 if equal
   */
  function pickupCompare(pickupA, pickupB) {
    const dateA = pickupA?.pickupDate
    const dateB = pickupB?.pickupDate

    if (!dateA) return -1
    if (!dateB) return 1

    return new Date(dateA) - new Date(dateB)
  }

  useEffect(() => {
    const filtered = pickups?.length ? pickups.filter(isInQuery) : []

    // sort by pickupDate then reverse to see most recent first
    const sorted = filtered.sort(pickupCompare).reverse()
    setFilteredPickups(sorted)
  }, [pickups, searchQuery])

  useEffect(() => {
    // navigate to login if not signed in
    if (pickupsError === pickupApiErrors.NOT_SIGNED_IN) {
      navigate('/login')
    }
  }, [pickupsError])

  return (
    <PageLayout showLogout={true}>
      <div className={styles.stickyContent}>
        <header className={styles.pageHeader}>
          Pickups
          <Button size='small' onClick={() => navigate('/pickups/new')}>
            New Pickup
          </Button>
        </header>
      </div>
      <div className={styles.search}>
        <img src={searchIcon} />
        <input
          className={styles.searchInput}
          type='text'
          placeholder='Search'
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <PickupsList
        pickups={filteredPickups}
        pickupsError={pickupsError}
        pickupsLoading={pickupsLoading}
      />
    </PageLayout>
  )
}

function PickupsList(props) {
  const { pickups, pickupsLoading, pickupsError } = props

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
