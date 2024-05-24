import styles from './Pickup.module.css'
import editIcon from '../assets/editIcon.svg'
import { useNavigate } from 'react-router-dom'

export default function Pickup(props) {
  const navigate = useNavigate()
  const { pickupDate, donorAgency, pickupId } = props

  /**
   *
   * @param {string} inputDate date in format of yyyy-mm-dd
   * @returns date in the format of mm/dd/yy without "0" padding
   */
  function formatDate(inputDate) {
    try {
      const [yearRaw, monthRaw, dayRaw] = inputDate.split('-')
      const year = yearRaw.slice(-2)
      const month = Number(monthRaw)
      const day = Number(dayRaw)

      return `${month}/${day}/${year}`
    } catch (error) {
      console.log(error)
      return inputDate
    }
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
