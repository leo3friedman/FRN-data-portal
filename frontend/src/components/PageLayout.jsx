import styles from './PageLayout.module.css'
export default function PageLayout({ children }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageContent}>{children}</div>
    </div>
  )
}
