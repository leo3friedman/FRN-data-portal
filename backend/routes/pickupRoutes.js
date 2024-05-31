import express from 'express'
import dotenv from 'dotenv'
import sampleData from './sampleData.json' assert { type: 'json' }
import { isValidToken } from './loginRoutes.js'
import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import credentials from './credentials.json' assert { type: 'json' }

dotenv.config()

const router = express.Router()

router.use(express.json()) // Ensure the body is parsed

const auth = new GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const defaultPickup = {
  id: -1,
  pickupDate: toPickupDate(),
  lastUpdatedDate: toPickupDate(),
  donorAgency: '',
  leadInitials: '',
  weightBakery: 0,
  weightBeverages: 0,
  weightDairy: 0,
  weightDry: 0,
  weightFrozen: 0,
  weightMeat: 0,
  weightNonFood: 0,
  weightPrepared: 0,
  weightProduce: 0,
  frozenTempStart: 0,
  frozenTempEnd: 0,
  refrigeratedTempStart: 0,
  refrigeratedTempEnd: 0,
}

router.get('/pickups', async (req, res) => {
  // validate user is signed in
  const token = req?.cookies?.token
  const isValid = await isValidToken(token)
  if (!isValid) {
    return res.status(401).json({ error: 'Not signed in!' })
  }

  // GET spreadsheet via Google API
  try {
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      range: 'Sheet1!A1:R', // FIXME: allow for variable number of columns
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
      const parsedPickup = parsePickup(pickup)
      return {
        id: parsedPickup.id,
        pickupDate: parsedPickup.pickupDate,
        donorAgency: parsedPickup.donorAgency,
      }
    })

    res.json(pickups)
  } catch (error) {
    console.error('error reading sheet: ', error)
    return res.status(500).json({ error: 'Error reading sheet' })
  }
})

router.get('/pickups/new', async (req, res) => {
  // validate user is signed in
  // const token = req?.cookies?.token
  // const isValid = await isValidToken(token)
  // if (!isValid) {
  //   return res.status(401).json({ error: 'Not signed in!' })
  // }
  // GET the column names and info from Form Specifier sheet
  try { 
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      range: 'Form Specifier', // FIXME: allow for variable number of columns
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
          if (column_object['Form Type'] === "Date") {
            column_object[key] = toPickupDate()
          }
          else if (column_object['Form Type'] === "Number") {
            column_object[key] = 0
          }
          else {
            // select or text should both be empty strings
            column_object[key] = ''
          }
        }
        else {
          // otherwise set the key's value to the form specififier
          column_object[key] = row[index]
        }
      })
      return column_object
    })
    res.json(form_specifier_json)
  }
  catch (error) {
    console.error('error reading form specifier: ', error)
    return res.status(500).json({ error: 'Error reading form specifier' })
  }
})

router.get('/pickups/:pickupId', async (req, res) => {
  // validate user is signed in
  // const token = req?.cookies?.token
  // const isValid = await isValidToken(token)
  // if (!isValid) {
  //   return res.status(401).json({ error: 'Not signed in!' })
  // }
  const id = req?.params?.pickupId

  if (isNaN(id)) {
    return res.status(403).json({ error: 'Pickup id must be a number!' })
  }

  //const return_format = ['Form Category', 'Form Label', 'Form Type', 'Value']
  const pickup_list = []
  // TODO: Add same format as pickups new
  // GET Form Specifier Values
  try { 
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      range: 'Form Specifier!A1:F', // FIXME: allow for variable number of columns
    })
    const form_specifier_values = sheetsResponse.data.values
    const form_keys = form_specifier_values[0]
    
    const form_specifier_json = form_specifier_values.slice(1).map((row) => {
      const column_object = {}
      form_keys.forEach((key, index) => {
        column_object[key] = row[index]
      })
      return column_object
    })
    
    const return_format = form_keys
    return_format.push('Value')
    form_specifier_json.forEach((row) => {
      const pickup_object = {}
      return_format.forEach((key) => {
        if (key === 'Value') {
          pickup_object[key] = null
        }
        else {
          pickup_object[key] = row[key]
        }
      })
      pickup_list.push(pickup_object)
    })
  }
  catch (error) {
    console.error('error reading form specifier: ', error)
    return res.status(500).json({ error: 'Error reading form specifier' })
  }

  // GET the actual value from sheet1
  try {
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ',
      range: 'Sheet1!A1:R', // FIXME: allow for variable number of columns
    })
    const pickupData = sheetsResponse.data.values

    // Grab column headers from data and find pickup where ids match
    const columnHeaders = pickupData[0]
    const pickupDataJsons = pickupData.slice(1).map((pickup) => {
      const pickupJson = {}
      columnHeaders.forEach((header, index) => {
        pickupJson[header] = pickup[index].trim()
      })
      return pickupJson
    })

    const pickup = pickupDataJsons.find((pickup) => pickup['Id'] === id)

    if (!pickup) {
      console.error('Pickup Not Found! ')
      return res.status(404).json({ error: 'Pickup Not Found!' })
    }
    // TODO: if no value in the table, send default vale

    pickup_list.forEach((row) => {
      // TODO : Do we need to check if the column exists first?
      
        row['Value'] = pickup[row['Form Label'].trim()]

    })

    res.json(pickup_list)
  } catch (error) {
    console.error('error reading sheet1: ', error)
    return res.status(500).json({ error: 'Error reading sheet1' })
  }
})

router.put('/pickups/new', async (req, res) => {
  // validate user is signed in
  const token = req?.cookies?.token
  const isValid = await isValidToken(token)
  if (!isValid) {
    return res.status(401).json({ error: 'Not signed in!' })
  }

  const sheets = google.sheets({ version: 'v4', auth })
  const sheetId = '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ'
  try {
    // fetch existing data to get column headers
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:R', // FIXME: allow for variable number of columns
    })
    const pickupData = sheetsResponse.data.values

    const columnHeaders = pickupData[0]

    // index of id field in a pickup data row
    const idIndex = columnHeaders.indexOf('Id')

    // convert pickupData to list of ids
    const ids = Array.from(pickupData)
      .slice(1)
      .map((data) => Number(data[idIndex]))

    // newId is one greater than largest current id
    const newId = Math.max(...ids) + 1

    // TODO: validate body
    const newPickup = req?.body

    // set newId
    newPickup['Id'] = newId

    // format pickup date from string to date
    newPickup['Pickup Date'] = toPickupDate(newPickup['Pickup Date'])

    // set last updated to now
    newPickup['Last Updated Date'] = toPickupDate()

    const new_row = []

    columnHeaders.forEach((header) => {
      new_row.push(newPickup[header])
    })

    const values = [new_row]

    const resource = {
      values,
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      resource,
    })

    console.log('Row added:', response.data.updates.updatedRange)
    res.status(200).send('Row added successfully')
  } catch (error) {
    console.error('Error adding new pickup ', error)
    return res.status(500).json({ error: 'Error adding new Pickup' })
  }
})

router.put('/pickups/:pickupId', async (req, res) => {
  // validate user is signed in
  const token = req?.cookies?.token
  const isValid = await isValidToken(token)
  if (!isValid) {
    return res.status(401).json({ error: 'Not signed in!' })
  }

  // TODO: validate request body format + move other validation to middleware?

  const id = req?.params?.pickupId

  if (isNaN(id)) {
    return res.status(403).json({ error: 'Pickup id must be a number!' })
  }

  const updatedPickup = req?.body

  // format pickup date from string to date
  updatedPickup['Pickup Date'] = toPickupDate(updatedPickup['Pickup Date'])

  // set last updated to now
  updatedPickup['Last Updated Date'] = toPickupDate()

  if (Number(id) !== Number(updatedPickup['Id'])) {
    return res
      .status(403)
      .json({ error: 'Pickup id must match updated pickup data' })
  }

  const sheets = google.sheets({ version: 'v4', auth })
  const sheetId = '1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ'
  try {
    // fetch existing data to get column headers
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:R', // FIXME: allow for variable number of columns
    })
    const pickupData = sheetsResponse.data.values

    const columnHeaders = pickupData[0]

    // parse pickup data for where the id matches and define range to update
    const indexOfRowToUpdate = pickupData.findIndex(
      (subArray) => subArray[0] === id
    )
    const rangeToUpdate = `Sheet1!A${parseInt(indexOfRowToUpdate) + 1}:R`

    // The values to insert into new range
    const new_row = []

    columnHeaders.forEach((header) => {
      new_row.push(updatedPickup?.[header])
    })

    const values = [new_row]

    const resource = {
      values,
    }

    // update the new range
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: rangeToUpdate,
      valueInputOption: 'USER_ENTERED',
      resource,
    })

    console.log('Row updated')
    res.status(200).send('Row updated successfully')
  } catch (error) {
    console.error('Error updating new pickup ', error)
    return res.status(500).json({ error: 'Error updating new Pickup' })
  }
})

// TODO: make sure to validate if signed in before (implementation in /pickups route)

function parsePickup(pickup) {
  const pickupDate = toPickupDate(pickup?.['Pickup Date'])

  return {
    id: pickup?.['Id'] ?? defaultPickup.id,
    pickupDate: pickupDate,
    lastUpdatedDate:
      pickup?.['Last Updated Date'] ?? defaultPickup.lastUpdatedDate,
    donorAgency: pickup?.['Donor Agency'] ?? defaultPickup.donorAgency,
    leadInitials: pickup?.['Lead Initials'] ?? defaultPickup.leadInitials,
    weightBakery: pickup?.['Lbs Bakery'] ?? defaultPickup.weightBakery,
    weightBeverages: pickup?.['Lbs Beverages'] ?? defaultPickup.weightBeverages,
    weightDairy: pickup?.['Lbs Dairy'] ?? defaultPickup.weightDairy,
    weightDry: pickup?.['Lbs Dry'] ?? defaultPickup.weightDry,
    weightFrozen: pickup?.['Lbs Frozen'] ?? defaultPickup.weightFrozen,
    weightMeat: pickup?.['Lbs Meat'] ?? defaultPickup.weightMeat,
    weightNonFood: pickup?.['Lbs Non-Food'] ?? defaultPickup.weightNonFood,
    weightPrepared: pickup?.['Lbs Prepared'] ?? defaultPickup.weightPrepared,
    weightProduce: pickup?.['Lbs Produce'] ?? defaultPickup.weightProduce,
    frozenTempStart:
      pickup?.['Frozen Temp Start'] ?? defaultPickup.frozenTempStart,
    frozenTempEnd: pickup?.['Frozen Temp End'] ?? defaultPickup.frozenTempEnd,
    refrigeratedTempStart:
      pickup?.['Refrigerated Temp Start'] ??
      defaultPickup.refrigeratedTempStart,
    refrigeratedTempEnd:
      pickup?.['Refrigerated Temp Start'] ?? defaultPickup.refrigeratedTempEnd,
  }
}

// Assuming all pickup operations occur in PST
function toPickupDate(pastDate = Date.now()) {
  try {
    const date = new Date(pastDate)
    const offset = date.getTimezoneOffset()
    const myDate = new Date(date.getTime() - offset * 60 * 1000)
    return myDate.toISOString().split('T')[0]
  } catch (error) {
    console.log(error)
    return pastDate
  }
}

export default router
