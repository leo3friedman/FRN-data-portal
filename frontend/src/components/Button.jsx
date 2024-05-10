import styles from './Button.module.css'

export default function Button(props) {
  const { children } = props
  return <button className={styles.button}>{children}</button>
}
