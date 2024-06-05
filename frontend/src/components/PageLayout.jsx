import styles from './PageLayout.module.css'
import groceryBag from '../assets/groceryBag.png'

export default function PageLayout({ children }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageContentContainer}>
        <header className={styles.pageHeader} />
        <div className={styles.pageContent}>{children}</div>
      </div>
      <footer className={styles.pageFooter}>
        <img className={styles.groceryBag} src={groceryBag}></img>
      </footer>
    </div>
  )
}
