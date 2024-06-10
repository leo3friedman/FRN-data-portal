import { LoadingCircle } from './index'
import styles from './Button.module.css'

export default function Button(props) {
  const { children, size, onClick, buttonProps, loading } = props

  const sizeClasses = {
    small: 'smallSize',
    default: 'defaultSize',
  }

  

  const sizeClass = sizeClasses.hasOwnProperty(size)
    ? sizeClasses[size]
    : sizeClasses.default

  return (
    <div className={styles.buttonContainer}>
      <button
        className={`${styles.button} ${styles[sizeClass]} ${loading ? styles.loading : ''}`}
        onClick={onClick}
        {...buttonProps}>
        {children}
      </button>

      {loading && (
        <div className={styles.loadingCircleContainer}>
          <LoadingCircle size='small' />
        </div>
      )}
    </div>
  )
}
