import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, PageLayout } from '../components/index.js'
import arrowLeftIcon from '../assets/arrowLeftIcon.svg'
import styles from './FormPage.module.css'
import { useParams } from 'react-router-dom'

export default function FormPage(props) {
  const { isNewPickup } = props
  const { pickupId } = useParams()
  const navigate = useNavigate()
  const [pickup, setPickup] = useState({})

  async function loadPickup() {
    const URL = `http://localhost:3000/pickups/${isNewPickup ? 'new' : pickupId}`
    const response = await fetch(URL, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) {
      if (response.status === 401) {
        navigate('/login')
      }
    }
    const result = await response.json()
    setPickup(result)
  }

  useEffect(() => {
    loadPickup()
  }, [])

  return (
    <PageLayout>
      <div className={styles.stickyContent}>
        <nav className={styles.returnToPickups} onClick={() => navigate('/')}>
          <img src={arrowLeftIcon} />
          Return to Pickups
        </nav>
        <header className={styles.pageHeader}>
          {isNewPickup ? 'Create New Pickup' : 'Edit Pickup'}
        </header>
      </div>
      <form className={styles.pickupForm}>
        <div className={styles.formCategory}>
          <div className={styles.formCategoryHeader}>Vendor Information</div>
          <ul className={`${styles.formFieldList}`}>
            <li>
              <VendorInfoField
                label={'Lead Initial'}
                defaultValue={pickup?.leadInitials}
              />
            </li>
            <li>
              <VendorInfoField
                label='Pickup Date'
                defaultValue={pickup?.pickupDate}
                inputType='date'
                required
              />
            </li>
            <li>
              <VendorInfoField
                label={'Donor Agency'}
                defaultValue={pickup?.donorAgency}
                required
              />
            </li>
          </ul>
        </div>
        <div className={styles.formCategory}>
          <div className={styles.formCategoryHeader}>Weights</div>
          <ul className={`${styles.formFieldList}`}>
            <li>
              <WeightField
                label='Produce'
                defaultValue={pickup?.weightProduce}
              />
            </li>
            <li>
              <WeightField label='Dry' defaultValue={pickup?.weightDry} />
            </li>
            <li>
              <WeightField
                label='Prepared'
                defaultValue={pickup?.weightPrepared}
              />
            </li>
            <li>
              <WeightField label='Meat' defaultValue={pickup?.weightMeat} />
            </li>
            <li>
              <WeightField label='Dairy' defaultValue={pickup?.weightDairy} />
            </li>
            <li>
              <WeightField label='Bakery' defaultValue={pickup?.weightBakery} />
            </li>
            <li>
              <WeightField label='Frozen' defaultValue={pickup?.weightFrozen} />
            </li>
            <li>
              <WeightField
                label='Beverages'
                defaultValue={pickup?.weightBeverages}
              />
            </li>
            <li>
              <WeightField
                label='Non-Food'
                defaultValue={pickup?.weightNonFood}
              />
            </li>
          </ul>
        </div>
        <div className={styles.formCategory}>
          <div className={styles.formCategoryHeader}>Temperatures</div>
          <ul className={`${styles.formFieldList}`}>
            <li>
              <WeightField
                label='Refrigerated Start'
                defaultValue={pickup?.refrigeratedTempStart}
              />
            </li>
            <li>
              <WeightField
                label='Refrigerated End'
                defaultValue={pickup?.refrigeratedTempEnd}
              />
            </li>
            <li>
              <WeightField
                label='Frozen Start'
                defaultValue={pickup?.frozenTempStart}
              />
            </li>
            <li>
              <WeightField
                label='Frozen End'
                defaultValue={pickup?.refrigeratedTempEnd}
              />
            </li>
          </ul>
        </div>
        <Button size='small'>Submit Pickup</Button>
      </form>
    </PageLayout>
  )
}

function WeightField(props) {
  const { label, defaultValue } = props
  return (
    <div className={styles.weightFieldContainer}>
      <label>{label}</label>
      <input
        type='number'
        step='5'
        min='0'
        max='10000'
        defaultValue={defaultValue}
      />
    </div>
  )
}

function VendorInfoField(props) {
  const { label, defaultValue, inputType, required } = props
  return (
    <div className={styles.vendorInfoFieldContainer}>
      <label>{label}</label>
      <input
        type={inputType ?? 'text'}
        required={required ?? false}
        defaultValue={defaultValue}></input>
    </div>
  )
}
