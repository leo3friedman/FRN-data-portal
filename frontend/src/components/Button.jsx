import styles from './Button.module.css'

export default function Button(props) {
  const { children, size } = props

  const sizeClasses = {
    small: 'smallSize',
    default: 'defaultSize',
  }

  const sizeClass = sizeClasses.hasOwnProperty(size)
    ? sizeClasses[size]
    : sizeClasses.default

  return (
    <button className={`${styles.button} ${styles[sizeClass]}`}>
      {children}
    </button>
  )
}
