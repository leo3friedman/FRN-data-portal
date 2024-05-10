import { useLoaderData } from 'react-router-dom'
export default function FormPage(props) {
  const { isNewPickup } = props
  const pickup = isNewPickup ? {} : useLoaderData()
  return (
    <>
      <h1>FORM PAGE</h1>
    </>
  )
}
