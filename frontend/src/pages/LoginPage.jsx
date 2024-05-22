import { Button, PageLayout } from '../components/index.js'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  return (
    <PageLayout>
      <header className={styles.pageTitle}>
        Food Recovery Network Data Portal
      </header>
      <div className={styles.login}>
        <div>Please sign in to continue</div>
        <Button
          onClick={() => (location.href = 'http://localhost:3000/googleauth')}>
          Sign in with Google
        </Button>
      </div>
    </PageLayout>
  )
}
