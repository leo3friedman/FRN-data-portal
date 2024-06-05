import { Button, PageLayout } from '../components/index.js'
import styles from './LoginPage.module.css'
import dancingFruits from '../assets/dancingFruits.png'
import googleLogo from '../assets/googleLogo.png'

export default function LoginPage() {
  const url = new URL(window.location.href)
  const error = url.searchParams.get('error')

  async function login() {
    // TODO: error handling if this function fails?
    const expressUrl = import.meta.env.VITE_EXPRESS_URL
    window.location.href = `${expressUrl}/api/googleauth`
  }

  return (
    <PageLayout>
      <img src={dancingFruits} className={styles.dancingFruits}></img>
      <div className={styles.login}>
        <div className={styles.loginContent}>
          <h1 className={styles.loginHeader}>Food Recovery Network</h1>
          <button className={styles.loginButton} onClick={login}>
            <img className={styles.googleLogo} src={googleLogo}></img>Sign in
            with Google
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </PageLayout>
  )
}
