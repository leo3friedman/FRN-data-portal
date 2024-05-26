import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, PageLayout, LoadingCircle } from '../components/index.js'
import arrowLeftIcon from '../assets/arrowLeftIcon.svg'
import styles from './FormPage.module.css'
import { useParams } from 'react-router-dom'

import {
  getPickup,
  getNewPickup,
  putPickup,
  putNewPickup,
} from '../api/index.js'
import { pickupApiErrors } from '../api/enums.js'

export default function FormPage(props) {
  const { isNewPickup } = props
  const { pickupId } = useParams()

  const getPickupHook = isNewPickup
    ? () => getNewPickup()
    : () => getPickup(pickupId)

  const submitPickupHook = isNewPickup
    ? () => putNewPickup()
    : () => putPickup(pickupId)

  const navigate = useNavigate()

  const { pickup, pickupLoading, pickupError, fetchPickup } = getPickupHook()
  const { submitLoading, submitError, submitPickup, submitSuccess } =
    submitPickupHook()

  useEffect(() => {
    fetchPickup()
  }, [])

  async function onFormSubmit(event) {
    event.preventDefault()

    const formData = Array.from(event.target).reduce((formData, formInput) => {
      if (formInput?.name) {
        formData[formInput.name] = formInput.value
      }
      return formData
    }, {})

    if (!isNewPickup) formData['Id'] = pickupId

    submitPickup(formData)
  }

  if (
    pickupError === pickupApiErrors.NOT_SIGNED_IN ||
    submitError === pickupApiErrors.NOT_SIGNED_IN
  ) {
    navigate('/login')
  }

  if (submitSuccess) {
    // TODO: add some feedback here (ex. confetti)
    navigate('/')
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
      {pickupLoading ? (
        <div className={styles.loadingCircleContainer}>
          <LoadingCircle />
        </div>
      ) : pickupError ? (
        <div className={styles.error}>
          Error getting pickups. <br /> <br /> Please click <a href=''>here</a>{' '}
          to try again.
        </div>
      ) : (
        <PickupForm
          pickup={pickup}
          onFormSubmit={onFormSubmit}
          isNewPickup={isNewPickup}
          submitLoading={submitLoading}
          submitError={submitError}
        />
      )}
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

function PickupForm(props) {
  const { pickup, onFormSubmit, isNewPickup, submitLoading, submitError } =
    props

  return (
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
              required
            />
          </li>
          <li>
            <NumberField
              label='Dry'
              defaultValue={pickup?.weightDry}
              name='Lbs Dry'
              required
            />
          </li>
          <li>
            <NumberField
              label='Prepared'
              defaultValue={pickup?.weightPrepared}
              name='Lbs Prepared'
              required
            />
          </li>
          <li>
            <NumberField
              label='Meat'
              defaultValue={pickup?.weightMeat}
              name='Lbs Meat'
              required
            />
          </li>
          <li>
            <NumberField
              label='Dairy'
              defaultValue={pickup?.weightDairy}
              name='Lbs Dairy'
              required
            />
          </li>
          <li>
            <NumberField
              label='Bakery'
              defaultValue={pickup?.weightBakery}
              name='Lbs Bakery'
              required
            />
          </li>
          <li>
            <NumberField
              label='Frozen'
              defaultValue={pickup?.weightFrozen}
              name='Lbs Frozen'
              required
            />
          </li>
          <li>
            <NumberField
              label='Beverages'
              defaultValue={pickup?.weightBeverages}
              name='Lbs Beverages'
              required
            />
          </li>
          <li>
            <NumberField
              label='Non-Food'
              defaultValue={pickup?.weightNonFood}
              name='Lbs Non-Food'
              required
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
              required
            />
          </li>
          <li>
            <NumberField
              label='Refrigerated End'
              defaultValue={pickup?.refrigeratedTempEnd}
              name='Refrigerated Temp End'
              required
            />
          </li>
          <li>
            <NumberField
              label='Frozen Start'
              defaultValue={pickup?.frozenTempStart}
              name='Frozen Temp Start'
              required
            />
          </li>
          <li>
            <NumberField
              label='Frozen End'
              defaultValue={pickup?.refrigeratedTempEnd}
              name='Frozen Temp End'
              required
            />
          </li>
        </ul>
      </div>
      <div>
        <Button size='small' type='submit' loading={submitLoading}>
          {isNewPickup ? 'Submit Pickup' : 'Submit Changes'}
        </Button>
        {submitError && !submitLoading && (
          <div className={styles.error}>
            Error submitting pickup. Please try again later.
          </div>
        )}
      </div>
    </form>
  )
}
