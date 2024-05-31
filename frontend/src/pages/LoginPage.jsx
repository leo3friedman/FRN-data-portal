import { Button, PageLayout } from '../components/index.js'
import styles from './LoginPage.module.css'

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
      <header className={styles.pageTitle}>
        Food Recovery Network Data Portal
      </header>
      <div className={styles.login}>
        <div>Please sign in to continue</div>
        <Button onClick={login}>Sign in with Google</Button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </PageLayout>
  )
}
