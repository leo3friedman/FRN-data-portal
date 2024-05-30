import { useState } from 'react'
import { Button, PageLayout } from '../components/index.js'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [loginError, setLoginError] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  async function login() {
    try {
      setLoginLoading(true)
      window.location.href = 'http://localhost:3000/googleauth'
    } catch (error) {
      setLoginError(true)
    } finally {
      setLoginLoading(false)
    }
  }
  return (
    <PageLayout>
      <header className={styles.pageTitle}>
        Food Recovery Network Data Portal
      </header>
      <div className={styles.login}>
        <div>Please sign in to continue</div>
        <Button loading={loginLoading} onClick={login}>
          Sign in with Google
        </Button>
        {loginError && (
          <div className={styles.error}>
            Sorry, we're having trouble logging you in. Please try again later.
          </div>
        )}
      </div>
    </PageLayout>
  )
}
