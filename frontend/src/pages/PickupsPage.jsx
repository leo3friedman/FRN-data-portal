import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, LoadingCircle } from '../components/index'
import { Pickup, PageLayout } from '../components/index.js'
import searchIcon from '../assets/searchIcon.svg'
import styles from './PickupsPage.module.css'
import { pickupApiErrors } from '../hooks/enums.js'
import { useGetPickups } from '../hooks/index.js'
import { formatDate } from '../utils.js'

export default function PickupsPage() {
  const navigate = useNavigate()
  const { pickups, pickupsLoading, fetchPickups, pickupsError } =
    useGetPickups()
  const [filteredPickups, setFilteredPickups] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPickups()
  }, [])

  /**
   *
   * @param {string} pickupDate
   * @param {string} donorAgency
   * @param {string} query
   * @returns true if query is in pickup otherwise false
   */
  function isInQuery(pickupDate, donorAgency, leadInitials, searchQuery) {
    try {
      const query = String(searchQuery).toLowerCase()
      const searchInitials = query.toLowerCase().startsWith(':')
      if (searchInitials) {
        const initialQuery = query.replace(':', '')
        return leadInitials && leadInitials.toLowerCase().includes(initialQuery)
      }

      const date = String(pickupDate).toLowerCase()
      const donor = String(donorAgency).toLowerCase()
      const queryInDate = date && date.includes(query)
      const queryInDonor = donor && donor.includes(query)
      return queryInDate || queryInDonor
    } catch (error) {
      return false
    }
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
    const filtered = pickups?.length
      ? pickups.filter(({ pickupDate, donorAgency, leadInitials }) =>
          isInQuery(
            formatDate(pickupDate),
            donorAgency,
            leadInitials,
            searchQuery
          )
        )
      : []

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
