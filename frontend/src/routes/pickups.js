import sampleData from '../assets/sampleData.json'

export async function pickupsLoader() {
  const response = await fetch('http://localhost:3000/pickups')
  const pickups = await response.json()
  return pickups
}

export async function newPickupLoader() {
  const response = await fetch('http://localhost:3000/pickups/new')
  const pickup = await response.json()
  return pickup
}

export async function pickupLoader({ params }) {
  const response = await fetch(
    `http://localhost:3000/pickups/${params.pickupId}`
  )

  if (!response.ok) {
    const body = await response?.json()
    throw new Error(body?.error)
  }

  const pickup = await response.json()
  return pickup
}
