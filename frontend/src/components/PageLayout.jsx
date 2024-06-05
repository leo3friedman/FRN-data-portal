import styles from './PageLayout.module.css'
import groceryBag from '../assets/groceryBag.png'
import { useNavigate } from 'react-router-dom'
import logOutIcon from '../assets/logOutIcon.svg'

export default function PageLayout({ children, showLogout }) {
  const navigate = useNavigate()
  async function logout() {
    try {
      const expressUrl = import.meta.env.VITE_EXPRESS_URL
      const response = await fetch(`${expressUrl}/api/logout`, {
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
    <div className={styles.page}>
      <div className={styles.pageContentContainer}>
        <header className={styles.pageHeader}>
          {showLogout && (
            <nav className={styles.logout} onClick={logout}>
              <img className={styles.logoutIcon} src={logOutIcon} />
              Logout
            </nav>
          )}
        </header>
        <div className={styles.pageContent}>{children}</div>
      </div>
      <footer className={styles.pageFooter}>
        <img className={styles.groceryBag} src={groceryBag}></img>
      </footer>
    </div>
  )
}
