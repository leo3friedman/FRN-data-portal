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

  useEffect(() => {
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
  }, [pickupError, submitError, submitSuccess])

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

      <PickupForm
        pickupLoading={pickupLoading}
        pickupError={pickupError}
        pickup={pickup}
        onFormSubmit={onFormSubmit}
        isNewPickup={isNewPickup}
        submitLoading={submitLoading}
        submitError={submitError}
      />
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
  const { label, defaultValue, required } = props
  return (
    <Field
      label={label}
      inputProps={{
        type: 'number',
        min: '0',
        defaultValue: defaultValue,
        required: required,
        name: label,
      }}
    />
  )
}

function DateField(props) {
  const { label, defaultValue, required } = props
  return (
    <Field
      label={label}
      inputProps={{
        type: 'date',
        required: required,
        defaultValue: defaultValue,
        name: label,
      }}
    />
  )
}

function TextField(props) {
  const { label, defaultValue, required } = props
  return (
    <Field
      label={label}
      inputProps={{
        type: 'text',
        required: required,
        defaultValue: defaultValue,
        name: label,
      }}
    />
  )
}

function FormField(props) {
  const { label, type, required, value } = props

  if (type === 'Number') {
    return (
      <NumberField label={label} required={required} defaultValue={value} />
    )
  }

  if (type === 'Select') {
    return <TextField label={label} required={required} defaultValue={value} />
  }

  if (type === 'Date') {
    return <DateField label={label} required={required} defaultValue={value} />
  }

  return <TextField label={label} required={required} defaultValue={value} />
}

function FormCategory(props) {
  const { category, fields } = props
  return (
    <div className={styles.formCategory}>
      <div className={styles.formCategoryHeader}>{category}</div>
      <ul className={`${styles.formFieldList}`}>
        {fields?.length &&
          fields.map((field) => {
            return (
              <li>
                <FormField {...field} />
              </li>
            )
          })}
      </ul>
    </div>
  )
}

function PickupForm(props) {
  const {
    pickup,
    onFormSubmit,
    isNewPickup,
    submitLoading,
    submitError,
    pickupLoading,
    pickupError,
  } = props

  const formBlueprint = pickup.reduce((blueprint, fieldInfo) => {
    const fieldCategory = fieldInfo?.['Form Category']
    const categoryExists = blueprint.some(
      (categoryInfo) => categoryInfo?.category === fieldCategory
    )

    if (!categoryExists) {
      blueprint.push({ category: fieldCategory, fields: [] })
    }

    const blueprintCategoryObject = blueprint.find(
      (categoryInfo) => categoryInfo?.category === fieldCategory
    )

    blueprintCategoryObject.fields.push({
      label: fieldInfo?.['Form Label'],
      type: fieldInfo?.['Form Type'],
      required: fieldInfo?.['Required'] === 'TRUE',
      value: fieldInfo?.['Value'],
    })
    return blueprint
  }, [])

  if (pickupLoading) {
    return (
      <div className={styles.loadingCircleContainer}>
        <LoadingCircle />
      </div>
    )
  }

  if (pickupError) {
    return (
      <div className={styles.error}>
        Error getting pickups. <br /> <br /> Please click <a href=''>here</a> to
        try again.
      </div>
    )
  }

  return (
    <form className={styles.pickupForm} onSubmit={onFormSubmit}>
      {formBlueprint?.length ? (
        formBlueprint.map((category) => <FormCategory {...category} />)
      ) : (
        <div className={styles.error}>
          Sorry, unable to build form. Please click <a href=''>here</a> to try
          again.{' '}
        </div>
      )}
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
