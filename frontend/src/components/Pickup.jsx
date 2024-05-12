import styles from './Pickup.module.css'
import editIcon from '../assets/editIcon.svg'
import { useNavigate } from 'react-router-dom'

export default function Pickup(props) {
  const navigate = useNavigate()
  const { pickupDate, donorAgency, pickupId } = props
  return (
    <div
      className={styles.pickup}
      onClick={() => navigate(`/pickups/${pickupId}`)}>
      <div className={styles.pickupDate}>{pickupDate}</div>
      <div className={styles.donorAgency}>{donorAgency}</div>
      <img className={styles.editIcon} src={editIcon} />
    </div>
  )
}
