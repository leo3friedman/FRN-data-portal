import styles from './Button.module.css'

export default function Button(props) {
  const { label } = props
  return <button className={styles.button}>{label}</button>
}
