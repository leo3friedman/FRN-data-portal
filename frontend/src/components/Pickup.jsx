import styles from './Pickup.module.css'
import editIcon from '../assets/editIcon.svg'
import { useNavigate } from 'react-router-dom'

export default function Pickup(props) {
  const navigate = useNavigate()
  const { pickupDate, donorAgency, pickupId } = props

  function formatDate(inputDate) {
    // Parse the input date string
    const date = new Date(inputDate)

    // Get the individual components (month, day, year)
    const year = date.getFullYear().toString().slice(-2) // Get the last two digits of the year
    const month = (date.getMonth() + 1).toString() // Month is zero-based, so add 1
    const day = date.getDate().toString()

    // Format the date as MM/DD/YY
    return `${month}/${day}/${year}`
  }
  return (
    <div
      className={styles.pickup}
      onClick={() => navigate(`/pickups/${pickupId}`)}>
      <div className={styles.pickupDate}>{formatDate(pickupDate)}</div>
      <div className={styles.donorAgency}>{donorAgency}</div>
      <img className={styles.editIcon} src={editIcon} />
    </div>
  )
}
