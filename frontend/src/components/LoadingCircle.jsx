import styles from './LoadingCircle.module.css'
export default function LoadingCircle(props) {
  const { size } = props
  return <div className={`${styles.loadingCircle} ${styles[size]}`}></div>
}
