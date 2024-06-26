import express from 'express'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { isValidToken } from './loginRoutes.js'
import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import credentials from './credentials.json' assert { type: 'json' }

dotenv.config()

const router = express.Router()

// ensure the body is parsed
router.use(express.json())

const auth = new GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

router.get('/pickups', async (req, res) => {
  try {
    // validate user is signed in
    const token = req?.cookies?.token
    const isValid = await isValidToken(token)
    if (!isValid) {
      return res.status(401).json({ error: 'Not signed in!' })
    }

    // GET spreadsheet via Google API
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      range: process.env.COMPLETE_DATA_SHEET,
    })
    const pickupData = sheetsResponse.data.values

    // Grab spreadsheet column headers and create JSON objects for all rows
    const columnHeaders = pickupData[0]

    const pickupDataJsons = pickupData.slice(1).map((pickup) => {
      const pickupJson = {}
      columnHeaders.forEach((header, index) => {
        pickupJson[header] = pickup[index]
      })
      return pickupJson
    })

    // Map the JSON objects to desired information for pickups page
    const pickups = pickupDataJsons.map((pickup) => {
      return {
        id: pickup?.['Id'],
        pickupDate: pickup?.['Pickup Date'],
        donorAgency: pickup?.['Donor Agency'],
        leadInitials: pickup?.['Lead Initials'],
      }
    })

    res.json(pickups)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error reading sheet' })
  }
})

router.get('/pickups/new', async (req, res) => {
  try {
    // validate user is signed in
    const token = req?.cookies?.token
    const isValid = await isValidToken(token)
    if (!isValid) {
      return res.status(401).json({ error: 'Not signed in!' })
    }

    // GET the column names and info from Form Specifier sheet
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      range: process.env.FORM_SPECIFIER_SHEET,
    })
    const form_specifier_values = sheetsResponse.data.values

    const form_keys = form_specifier_values[0]
    const return_format = form_keys
    return_format.push('Value')
    const form_specifier_json = form_specifier_values.slice(1).map((row) => {
      const column_object = {}
      return_format.forEach((key, index) => {
        // First check if the key we are trying to format is the value
        if (key === 'Value') {
          if (column_object['Form Type'] === 'Date') {
            column_object[key] = todaysDate()
          } else if (column_object['Form Type'] === 'Number') {
            column_object[key] = 0
          } else {
            // select or text should both be empty strings
            column_object[key] = ''
          }
        } else {
          // otherwise set the key's value to the form specififier
          column_object[key] = row[index]
        }
      })
      return column_object
    })
    res.json(form_specifier_json)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: `Error reading ${process.env.COMPLETE_DATA_SHEET}` })
  }
})

router.get('/pickups/:pickupId', async (req, res) => {
  try {
    /**
     * validate user is signed in
     */

    const token = req?.cookies?.token
    const isValid = await isValidToken(token)

    if (!isValid) {
      return res.status(401).json({ error: 'Not signed in!' })
    }

    const id = req?.params?.pickupId

    if (!id) {
      return res.status(403).json({ error: 'Request missing pickupId!' })
    }

    /**
     * get Form Specifier and pickup data values
     */

    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      ranges: [
        process.env.FORM_SPECIFIER_SHEET,
        process.env.COMPLETE_DATA_SHEET,
      ],
    })
    const [formSpecifierData, pickupData] = sheetsResponse.data.valueRanges
    const form_specifier_values = formSpecifierData.values
    const pickupValues = pickupData.values

    /**
     * parse Form Specifier and pickup values into json
     */

    const form_keys = form_specifier_values[0]
    const form_specifier_json = form_specifier_values.slice(1).map((row) => {
      const column_object = {}
      form_keys.forEach((key, index) => {
        column_object[key] = row[index]
      })
      return column_object
    })

    const pickupDataColumnHeaders = pickupValues[0]
    const pickupDataJsons = pickupValues.slice(1).map((pickup) => {
      const pickupJson = {}
      pickupDataColumnHeaders.forEach((header, index) => {
        pickupJson[header] = pickup[index]
      })
      return pickupJson
    })

    /**
     * populate return object (pickup_list) with Form Specifier values
     */

    const pickup_list = []
    const return_format = form_keys
    return_format.push('Value')
    form_specifier_json.forEach((row) => {
      const pickup_object = {}
      return_format.forEach((key) => {
        if (key === 'Value') {
          if (pickup_object['Form Type'] === 'Date') {
            pickup_object[key] = todaysDate()
          } else if (pickup_object['Form Type'] === 'Number') {
            pickup_object[key] = 0
          } else {
            // select or text should both be empty strings
            pickup_object[key] = ''
          }
        } else {
          pickup_object[key] = row[key]
        }
      })
      pickup_list.push(pickup_object)
    })

    /**
     * populate return object (pickup_list) with pickup values
     */

    // find pickup with matching id to query parameter
    const pickup = pickupDataJsons.find((pickup) => pickup['Id'] === id)

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup Not Found!' })
    }

    pickup_list.forEach((row) => {
      row['Value'] = pickup[row['Form Label']]
    })

    res.status(200).json(pickup_list)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: `Error reading ${process.env.COMPLETE_DATA_SHEET}` })
  }
})

router.put('/pickups/new', async (req, res) => {
  try {
    // validate user is signed in
    const token = req?.cookies?.token
    const isValid = await isValidToken(token)
    if (!isValid) {
      return res.status(401).json({ error: 'Not signed in!' })
    }

    /**
     * First check our Form Specifier to see if form labels have changed
     */
    const sheetId = '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ'

    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: [
        process.env.FORM_SPECIFIER_SHEET,
        process.env.COMPLETE_DATA_SHEET,
      ],
    })
    const [formSpecifierData, pickupData] = sheetsResponse.data.valueRanges
    const form_specifier_values = formSpecifierData.values
    const pickupValues = pickupData.values

    const allDataColumnHeaders = pickupValues[0]

    /* Get form labels from form specifier sheet
     */
    const formLabels = form_specifier_values
      .slice(1)
      .map((subList) => subList[1])
    // TODO: validate body
    const newPickup = req?.body

    // Find form labels of new pickup
    const newPickupFormLabels = newPickup.map(
      ({ 'Form Label': label }) => label
    )

    // Check if two labels are the same. if so continue. Else return error
    if (
      newPickupFormLabels.length !== formLabels.length ||
      !newPickupFormLabels.every((item) => formLabels.includes(item)) ||
      !formLabels.every((item) => newPickupFormLabels.includes(item))
    ) {
      console.log('Invalid Pickup Format')
      return res
        .status(500)
        .json({ error: 'Error adding new Pickup - Invalid Pickup Format' })
    } else {
      // Create pickupJson for easier iteration
      const pickupJson = {}
      newPickup.forEach((obj) => {
        pickupJson[obj['Form Label']] = obj['Value']
      })

      // set newId
      pickupJson['Id'] = crypto.randomUUID()
      newPickupFormLabels.push('Id')

      // set last updated to now
      pickupJson['Last Updated Date'] = todaysDate()
      newPickupFormLabels.push('Last Updated Date')

      // Mark deprecated columns
      const pickupLabelSet = new Set(newPickupFormLabels)
      allDataColumnHeaders.forEach((header, index) => {
        if (!pickupLabelSet.has(header)) {
          pickupJson[header] = ''
          pickupLabelSet.delete(header)
        } else {
          pickupLabelSet.delete(header)
        }
      })

      // Add any new column headers
      if (pickupLabelSet.size > 0) {
        const newHeaders = allDataColumnHeaders.concat([...pickupLabelSet])
        const values = [newHeaders]
        const resource = {
          values,
        }
        const headerUpdateResponse = await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${process.env.COMPLETE_DATA_SHEET}!A1`,
          valueInputOption: 'USER_ENTERED',
          resource,
        })
      }

      // Add a new row to the sheet
      const new_row = []

      const updatedColumnHeaders = allDataColumnHeaders.concat([
        ...pickupLabelSet,
      ])
      updatedColumnHeaders.forEach((header) => {
        new_row.push(pickupJson[header])
      })

      const values = [new_row]

      const resource = {
        values,
      }

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: process.env.COMPLETE_DATA_SHEET,
        valueInputOption: 'USER_ENTERED',
        resource,
      })

      console.log('Row added:', response.data.updates.updatedRange)
      res.status(200).send('Row added successfully')
    }
  } catch (error) {
    console.error('Error adding new pickup ', error)
    return res.status(500).json({ error: 'Error adding new Pickup' })
  }
})

router.put('/pickups/:pickupId', async (req, res) => {
  try {
    // validate user is signed in
    const token = req?.cookies?.token
    const isValid = await isValidToken(token)
    if (!isValid) {
      return res.status(401).json({ error: 'Not signed in!' })
    }

    // TODO: validate request body format + move other validation to middleware?
    const id = req?.params?.pickupId

    if (!id) {
      return res.status(403).json({ error: 'Request missing pickupId!' })
    }

    const updatedPickup = req?.body

    /**
     * First check our Form Specifier to see if form labels have changed
     */
    const sheetId = '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ'

    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: [
        process.env.FORM_SPECIFIER_SHEET,
        process.env.COMPLETE_DATA_SHEET,
      ],
    })
    const [formSpecifierData, pickupData] = sheetsResponse.data.valueRanges
    const form_specifier_values = formSpecifierData.values
    const pickupValues = pickupData.values

    const allDataColumnHeaders = pickupValues[0]

    /* Get form labels from form specifier sheet
     */
    const formLabels = form_specifier_values
      .slice(1)
      .map((subList) => subList[1])

    // Since this is an update pickupId, we should expect an Id field as well
    formLabels.push('Id')

    // Find form labels of updated pickup
    const updatedPickupFormLabels = updatedPickup.map(
      ({ 'Form Label': label }) => label
    )

    // Check if two labels are the same. if so continue. Else return error
    if (
      updatedPickupFormLabels.length !== formLabels.length ||
      !updatedPickupFormLabels.every((item) => formLabels.includes(item)) ||
      !formLabels.every((item) => updatedPickupFormLabels.includes(item))
    ) {
      console.log(updatedPickup)
      console.log('Invalid Pickup Format')
      return res
        .status(500)
        .json({ error: 'Error adding new Pickup - Invalid Pickup Format' })
    } else {
      // Create pickupJson for easier iteration
      const pickupJson = {}
      updatedPickup.forEach((obj) => {
        pickupJson[obj['Form Label']] = obj['Value']
      })

      // set last updated to now
      pickupJson['Last Updated Date'] = todaysDate()
      updatedPickupFormLabels.push('Last Updated Date')

      // Mark deprecated columns
      const pickupLabelSet = new Set(updatedPickupFormLabels)
      allDataColumnHeaders.forEach((header, index) => {
        if (!pickupLabelSet.has(header)) {
          pickupJson[header] = ''
          pickupLabelSet.delete(header)
        } else {
          pickupLabelSet.delete(header)
        }
      })

      // Add any new column headers
      if (pickupLabelSet.size > 0) {
        const newHeaders = allDataColumnHeaders.concat([...pickupLabelSet])
        const values = [newHeaders]
        const resource = {
          values,
        }
        const headerUpdateResponse = await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${process.env.COMPLETE_DATA_SHEET}!A1`,
          valueInputOption: 'USER_ENTERED',
          resource,
        })
      }

      // parse pickup data for where the id matches and define range to update
      const indexOfRowToUpdate = pickupValues.findIndex(
        (subArray) => subArray[0] === id
      )
      const rangeToUpdate = `${process.env.COMPLETE_DATA_SHEET}!A${
        parseInt(indexOfRowToUpdate) + 1
      }`

      // The values to insert into new range
      const new_row = []

      const updatedColumnHeaders = allDataColumnHeaders.concat([
        ...pickupLabelSet,
      ])

      updatedColumnHeaders.forEach((header) => {
        new_row.push(pickupJson[header])
      })

      const values = [new_row]

      const resource = {
        values,
      }

      // update the values at the specified range
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: rangeToUpdate,
        valueInputOption: 'USER_ENTERED',
        resource,
      })

      console.log(`Updated row ${rangeToUpdate}`)
      res.status(200).send('Row updated successfully')
    }
  } catch (error) {
    console.error('Error updating new pickup ', error)
    return res.status(500).json({ error: 'Error updating new Pickup' })
  }
})

router.delete('/pickups/delete/:pickupId', async (req, res) => {
  try {
    const token = req?.cookies?.token
    const isValid = await isValidToken(token)

    if (!isValid) {
      return res.status(401).json({ error: 'Not signed in!' })
    }

    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ'
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: process.env.COMPLETE_DATA_SHEET,
    })
    const sheetValues = sheetsResponse.data.values
    const columns = sheetValues[0]
    const indexOfIdInRow = columns.indexOf('Id')
    const idToDelete = req?.params?.pickupId
    const indexToDelete = sheetValues.findIndex(
      (row) => row[indexOfIdInRow] === idToDelete
    )

    if (indexToDelete === 0) {
      return res.status(405).json({ error: 'Cannot delete row 0!' })
    }

    if (indexToDelete === -1) {
      return res.status(404).json({ error: `Id ${idToDelete} not found!` })
    }

    // This id is the sheetId in url pattern: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=sheetId
    const spreadsheetTabId = '0'

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: spreadsheetTabId,
                dimension: 'ROWS',
                startIndex: indexToDelete,
                endIndex: indexToDelete + 1,
              },
            },
          },
        ],
      },
    })

    return res.status(200).json({ message: 'Delete succeeded!' })
  } catch (error) {
    return res.status(500).json({ error })
  }
})

/**
 *
 * @returns date of today (PST) in format yyyy-mm-dd
 */
function todaysDate() {
  const dateTime = new Date()
  const dateTimeStr = dateTime.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
  })
  const date = dateTimeStr.split(',')[0]
  const [month, day, year] = date.split('/')
  const monthPadded = `0${month}`.slice(-2)
  const dayPadded = `0${day}`.slice(-2)
  return `${year}-${monthPadded}-${dayPadded}`
}

export async function getValidEmails() {
  try {
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      range: 'Allowed Emails',
    })
    const data = sheetsResponse.data.values
    const formattedData = data.slice(1).flat()
    return formattedData
  } catch (error) {
    console.log(error)
    return []
  }
}

export default router
