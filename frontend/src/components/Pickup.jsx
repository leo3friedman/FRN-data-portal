import styles from './Pickup.module.css'
import editIcon from '../assets/editIcon.svg'

export default function Pickup(props) {
  const { pickupDate, donorAgency, pickupId } = props
  return (
    <div className={styles.pickup}>
      <div className={styles.pickupDate}>{pickupDate}</div>
      <div className={styles.donorAgency}>{donorAgency}</div>
      <img className={styles.editIcon} src={editIcon} />
    </div>
  )
}
