import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, PageLayout, LoadingCircle } from '../components/index.js'
import arrowLeftIcon from '../assets/arrowLeftIcon.svg'
import warningIcon from '../assets/warningIcon.svg'
import styles from './FormPage.module.css'
import { useParams } from 'react-router-dom'

import {
  useGetPickup,
  useGetNewPickup,
  usePutPickup,
  usePutNewPickup,
  useDeletePickup,
} from '../hooks/index.js'
import { pickupApiErrors } from '../hooks/enums.js'

export default function FormPage(props) {
  const { isNewPickup } = props
  const { pickupId } = useParams()

  const getPickupHook = isNewPickup
    ? () => useGetNewPickup()
    : () => useGetPickup(pickupId)

  const submitPickupHook = isNewPickup
    ? () => usePutNewPickup()
    : () => usePutPickup(pickupId)

  const navigate = useNavigate()

  const { pickup, pickupLoading, pickupError, fetchPickup } = getPickupHook()
  const { submitLoading, submitError, submitPickup, submitSuccess } =
    submitPickupHook()
  const { deleteLoading, deleteError, deletePickup, deleteSuccess } =
    useDeletePickup(pickupId)

  useEffect(() => {
    fetchPickup()
  }, [])

  useEffect(() => {
    if (
      pickupError === pickupApiErrors.NOT_SIGNED_IN ||
      submitError === pickupApiErrors.NOT_SIGNED_IN ||
      deleteError === pickupApiErrors.NOT_SIGNED_IN
    ) {
      navigate('/login')
    }

    if (submitSuccess || deleteSuccess) {
      // TODO: add some feedback here (ex. confetti)
      navigate('/')
    }
  }, [pickupError, submitError, submitSuccess, deleteSuccess, deleteError])

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

  async function handleDelete(event) {
    event.preventDefault()
    deletePickup(pickupId)
  }

  return (
    <PageLayout showLogout>
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
        deleteLoading={deleteLoading}
        deleteError={deleteError}
        handleDelete={handleDelete}
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
        step: '.01',
        defaultValue: defaultValue ?? '0',
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
        defaultValue: defaultValue ?? '',
        name: label,
      }}
    />
  )
}

function SelectField(props) {
  const { label, required, defaultValue, selectOptions } = props
  return (
    <div className={styles.fieldContainer}>
      <label>{label}</label>
      <select
        required={required}
        defaultValue={selectOptions.includes(defaultValue) ? defaultValue : ''}
        name={label}>
        <option value={''} disabled>
          Select One
        </option>
        {selectOptions?.length &&
          selectOptions?.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  )
}

function FormField(props) {
  const { label, type, required, value, selectOptions } = props

  if (type === 'Number') {
    return (
      <NumberField label={label} required={required} defaultValue={value} />
    )
  }

  if (type === 'Select') {
    return (
      <SelectField
        label={label}
        required={required}
        defaultValue={value}
        selectOptions={selectOptions}
      />
    )
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
              <li key={field?.label}>
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
    deleteLoading,
    deleteError,
    handleDelete,
  } = props

  const [isModalOpen, setIsModalOpen] = useState(false)

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
      selectOptions: fieldInfo?.['Select Options']
        ? fieldInfo?.['Select Options'].split(',')
        : [],
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
        formBlueprint.map((category, index) => <FormCategory key={index} {...category} />)
      ) : (
        <div className={styles.error}>
          Sorry, unable to build form. Please click <a href=''>here</a> to try
          again.{' '}
        </div>
      )}
      <div>
        <div className={styles.submitContainer}>
          <Button
            size='small'
            type='submit'
            loading={submitLoading}
            buttonProps={{
              style: {
                color: 'var(--secondary-white)',
                backgroundColor: 'var(--primary-green)',
              },
            }}>
            {isNewPickup ? 'Submit Pickup' : 'Submit Changes'}
          </Button>
          {!isNewPickup && (
            <div>
              <Button
                size='small'
                onClick={(event) => {
                  event.preventDefault()
                  setIsModalOpen(true)
                }}
                loading={deleteLoading}
                buttonProps={{
                  style: {
                    color: 'var(--secondary-white)',
                    backgroundColor: 'var(--caution-red)',
                  },
                }}>
                Delete Pickup
              </Button>
            </div>
          )}
        </div>

        {submitError && !submitLoading && (
          <div className={styles.error}>
            Error submitting pickup. Please try again later.
          </div>
        )}

        {deleteError && !deleteLoading && !isNewPickup && (
          <div className={styles.error}>
            Error deleting pickup. Please try again later.
          </div>
        )}

        <DeleteModal
          isOpen={isModalOpen}
          onClose={(event) => {
            event.preventDefault()
            setIsModalOpen(false)
          }}
          deleteLoading={deleteLoading}
          onDelete={handleDelete}
        />
      </div>
    </form>
  )
}

function DeleteModal({ onDelete, isOpen, onClose, deleteLoading }) {
  // TODO: make more accessible (listen for esc keypress, add x icon in corner)

  return (
    <>
      {isOpen && (
        <div className={styles.modalCanvas}>
          <div className={styles.modalWindow}>
            <div className={styles.modalContent}>
              <img src={warningIcon} className={styles.modalIcon}></img>
              <h2 className={styles.modalTitle}>
                Are you sure you want to delete this pickup?
              </h2>
              <div className={styles.modalSubtitle}>
                You will not be able to undo this decision
              </div>
              <div className={styles.modalActions}>
                <Button
                  size={'small'}
                  onClick={onDelete}
                  loading={deleteLoading}>
                  Yes, delete Pickup
                </Button>
                <Button size={'small'} onClick={onClose}>
                  No
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
