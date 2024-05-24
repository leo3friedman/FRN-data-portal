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

  async function submitNewPickup(pickupData) {
    const response = await fetch(`http://localhost:3000/pickups/new`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pickupData),
    })

    return response.ok
  }

  async function updatePickup(id, pickupData) {
    const response = await fetch(`http://localhost:3000/pickups/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pickupData),
    })

    return response.ok
  }

  async function onFormSubmit(event) {
    event.preventDefault()

    try {
      // agreggrate form data as json object
      const formData = Array.from(event.target).reduce(
        (formData, formInput) => {
          if (formInput?.name) {
            formData[formInput.name] = formInput.value
          }
          return formData
        },
        {}
      )

      if (!isNewPickup) formData['Id'] = pickupId

      const submitAction = isNewPickup
        ? () => submitNewPickup(formData)
        : () => updatePickup(pickupId, formData)

      const result = await submitAction()

      // return to pickups page on success
      if (result) navigate('/')
    } catch (error) {
      console.log(error)
      alert('Pickup submission failed, please try again later')
    }
  }

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
      <form className={styles.pickupForm} onSubmit={onFormSubmit}>
        <div className={styles.formCategory}>
          <div className={styles.formCategoryHeader}>Vendor Information</div>
          <ul className={`${styles.formFieldList}`}>
            <li>
              <TextField
                label='Lead Initials'
                defaultValue={pickup?.leadInitials}
                name='Lead Initials'
              />
            </li>
            <li>
              <DateField
                label='Pickup Date'
                defaultValue={pickup?.pickupDate}
                required
                name='Pickup Date'
              />
            </li>
            <li>
              <TextField
                label='Donor Agency'
                defaultValue={pickup?.donorAgency}
                required
                name='Donor Agency'
              />
            </li>
          </ul>
        </div>
        <div className={styles.formCategory}>
          <div className={styles.formCategoryHeader}>Weights</div>
          <ul className={`${styles.formFieldList}`}>
            <li>
              <NumberField
                label='Produce'
                defaultValue={pickup?.weightProduce}
                name='Lbs Produce'
              />
            </li>
            <li>
              <NumberField
                label='Dry'
                defaultValue={pickup?.weightDry}
                name='Lbs Dry'
              />
            </li>
            <li>
              <NumberField
                label='Prepared'
                defaultValue={pickup?.weightPrepared}
                name='Lbs Prepared'
              />
            </li>
            <li>
              <NumberField
                label='Meat'
                defaultValue={pickup?.weightMeat}
                name='Lbs Meat'
              />
            </li>
            <li>
              <NumberField
                label='Dairy'
                defaultValue={pickup?.weightDairy}
                name='Lbs Dairy'
              />
            </li>
            <li>
              <NumberField
                label='Bakery'
                defaultValue={pickup?.weightBakery}
                name='Lbs Bakery'
              />
            </li>
            <li>
              <NumberField
                label='Frozen'
                defaultValue={pickup?.weightFrozen}
                name='Lbs Frozen'
              />
            </li>
            <li>
              <NumberField
                label='Beverages'
                defaultValue={pickup?.weightBeverages}
                name='Lbs Beverages'
              />
            </li>
            <li>
              <NumberField
                label='Non-Food'
                defaultValue={pickup?.weightNonFood}
                name='Lbs Non-Food'
              />
            </li>
          </ul>
        </div>
        <div className={styles.formCategory}>
          <div className={styles.formCategoryHeader}>Temperatures</div>
          <ul className={`${styles.formFieldList}`}>
            <li>
              <NumberField
                label='Refrigerated Start'
                defaultValue={pickup?.refrigeratedTempStart}
                name='Refrigerated Temp Start'
              />
            </li>
            <li>
              <NumberField
                label='Refrigerated End'
                defaultValue={pickup?.refrigeratedTempEnd}
                name='Refrigerated Temp End'
              />
            </li>
            <li>
              <NumberField
                label='Frozen Start'
                defaultValue={pickup?.frozenTempStart}
                name='Frozen Temp Start'
              />
            </li>
            <li>
              <NumberField
                label='Frozen End'
                defaultValue={pickup?.refrigeratedTempEnd}
                name='Frozen Temp End'
              />
            </li>
          </ul>
        </div>
        <Button size='small' type='submit'>
          {isNewPickup ? 'Submit Pickup' : 'Submit Changes'}
        </Button>
      </form>
    </PageLayout>
  )
}

function Field(props) {
  const { label, inputProps } = props
  return (
    <div className={styles.fieldContainer}>
      <label>{label}</label>
      <input {...inputProps} />
    </div>
  )
}

function NumberField(props) {
  const { label, defaultValue, required, name } = props
  return (
    <Field
      label={label}
      inputProps={{
        type: 'number',
        min: '0',
        max: '10000',
        defaultValue: defaultValue,
        required: required,
        name: name,
      }}
    />
  )
}

function DateField(props) {
  const { label, defaultValue, required, name } = props
  return (
    <Field
      label={label}
      inputProps={{
        type: 'date',
        required: required,
        defaultValue: defaultValue,
        name: name,
      }}
    />
  )
}

function TextField(props) {
  const { label, defaultValue, required, name } = props
  return (
    <Field
      label={label}
      inputProps={{
        type: 'text',
        required: required,
        defaultValue: defaultValue,
        name: name,
      }}
    />
  )
}
