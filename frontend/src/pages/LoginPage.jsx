import { Button, PageLayout } from '../components/index.js'
import styles from './LoginPage.module.css'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  return (
    <PageLayout>
      <header className={styles.pageTitle}>
        Food Recovery Network Data Portal
      </header>
      <div className={styles.login}>
        <div>Please sign in to continue</div>
        <Button onClick={() => navigate('/')}>Sign in with Google</Button>
      </div>
    </PageLayout>
  )
}
