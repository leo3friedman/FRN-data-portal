import sampleData from '../assets/sampleData.json'

export async function pickupsLoader() {
  const pickups = sampleData.map((pickup) => ({
    id: pickup['Id'],
    pickupDate: pickup['Pickup Date'],
    donorAgency: pickup['Donor Agency'],
  }))
  return pickups
}

export async function pickupLoader({ params }) {
  const id = Number(params.pickupId)
  const pickup = sampleData.find((pickup) => pickup['Id'] === id)
  return pickup
}
