import sampleData from '../assets/sampleData.json'

export async function pickupsLoader() {
  const pickups = sampleData.map((pickup) => ({
    id: pickup['Id'],
    pickupDate: pickup['Pickup Date'],
    donorAgency: pickup['Donor Agency'],
  }))
  return pickups
}

const defaultPickup = {
  id: -1,
  pickupDate: null,
  lastUpdatedDate: null,
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

export async function pickupLoader({ params }) {
  if (params.pickupId === undefined || params.pickupId === null) {
    return defaultPickup
  }

  const id = Number(params.pickupId)

  const pickup = sampleData.find((pickup) => pickup['Id'] === id)

  return {
    id: pickup['Id'] ?? defaultPickup.id,
    pickupDate: pickup['Pickup Date'] ?? defaultPickup.pickupDate,
    lastUpdatedDate:
      pickup['Last Updated Date'] ?? defaultPickup.lastUpdatedDate,
    donorAgency: pickup['Donor Agency'] ?? defaultPickup.donorAgency,
    leadInitials: pickup['Lead Initials'] ?? defaultPickup.leadInitials,
    weightBakery: pickup['Lbs Bakery'] ?? defaultPickup.weightBakery,
    weightBeverages: pickup['Lbs Beverages'] ?? defaultPickup.weightBeverages,
    weightDairy: pickup['Lbs Dairy'] ?? defaultPickup.weightDairy,
    weightDry: pickup['Lbs Dry'] ?? defaultPickup.weightDry,
    weightFrozen: pickup['Lbs Frozen'] ?? defaultPickup.weightFrozen,
    weightMeat: pickup['Lbs Meat'] ?? defaultPickup.weightMeat,
    weightNonFood: pickup['Lbs Non-Food'] ?? defaultPickup.weightNonFood,
    weightPrepared: pickup['Lbs Prepared'] ?? defaultPickup.weightPrepared,
    weightProduce: pickup['Lbs Produce'] ?? defaultPickup.weightProduce,
    frozenTempStart:
      pickup['Frozen Temp Start'] ?? defaultPickup.frozenTempStart,
    frozenTempEnd: pickup['Frozen Temp End'] ?? defaultPickup.frozenTempEnd,
    refrigeratedTempStart:
      pickup['Refrigerated Temp Start'] ?? defaultPickup.refrigeratedTempStart,
    refrigeratedTempEnd:
      pickup['Refrigerated Temp Start'] ?? defaultPickup.refrigeratedTempEnd,
  }
}
