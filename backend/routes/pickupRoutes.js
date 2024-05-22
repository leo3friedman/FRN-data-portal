import express from "express";
import dotenv from "dotenv";
import sampleData from "./sampleData.json" assert { type: "json" };
import { isValidToken } from "./loginRoutes.js";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import credentials from "./credentials.json" assert { type: "json" };

dotenv.config();

const router = express.Router();

const auth = new GoogleAuth({
  credentials: credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const defaultPickup = {
  id: -1,
  pickupDate: toPickupDate(),
  lastUpdatedDate: "",
  donorAgency: "",
  leadInitials: "",
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
};

router.get("/pickups", async (req, res) => {
  // validate user is signed in
  const token = req?.cookies?.token;
  const isValid = await isValidToken(token);
  if (!isValid) {
    return res.status(401).json({ error: "Not signed in!" });
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: "1_pLDCNqM0KMUTpyiM1akEAIGLvNyswVBSvuE3MxKMgQ",
      range: "Sheet1!A1:R",
    });
    const pickupData = sheetsResponse.data.values;

    console.log("Data:");
    console.log(pickupData);

    const columnHeaders = pickupData[0];

    const pickupDataJsons = pickupData.slice(1).map(pickup => {
      const pickupJson = {}
      columnHeaders.forEach((header, index) => {
        pickupJson[header] = pickup[index];
      });
      return pickupJson;
    });

    const pickups = pickupDataJsons.map((pickup) => {
      const parsedPickup = parsePickup(pickup);
      return {
        id: parsedPickup.id,
        pickupDate: parsedPickup.pickupDate,
        donorAgency: parsedPickup.donorAgency,
      };
    });

    res.json(pickups);
  } catch (error) {
    console.error("error reading sheet: ", error);
    return res.status(500).json({ error: "Error reading sheet" });
  }
});

router.get("/pickups/new", async (req, res) => {
  const token = req?.cookies?.token;
  const isValid = await isValidToken(token);
  if (!isValid) {
    return res.status(401).json({ error: "Not signed in!" });
  }
  res.json(defaultPickup);
});

router.get("/pickups/:pickupId", async (req, res) => {
  const token = req?.cookies?.token;
  const isValid = await isValidToken(token);
  if (!isValid) {
    return res.status(401).json({ error: "Not signed in!" });
  }
  const id = req?.params?.pickupId;

  if (isNaN(id)) {
    return res.status(403).json({ error: "Pickup id must be a number!" });
  }

  // TODO: replace with real pickup (find it on the sheet)
  const pickup = sampleData.find((pickup) => pickup["Id"] === Number(id));

  if (!pickup) {
    return res.status(404).json({ error: "Pickup Not Found!" });
  }

  const parsedPickup = parsePickup(pickup);

  res.json(parsedPickup);
});

// TODO: create post route for creating a new pickup + editing a pickup
// TODO: make sure to validate if signed in before (implementation in /pickups route)

function parsePickup(pickup) {
  const pickupDate = toPickupDate(pickup?.["Pickup Date"]);

  return {
    id: pickup?.["Id"] ?? defaultPickup.id,
    pickupDate: pickupDate,
    lastUpdatedDate:
      pickup?.["Last Updated Date"] ?? defaultPickup.lastUpdatedDate,
    donorAgency: pickup?.["Donor Agency"] ?? defaultPickup.donorAgency,
    leadInitials: pickup?.["Lead Initials"] ?? defaultPickup.leadInitials,
    weightBakery: pickup?.["Lbs Bakery"] ?? defaultPickup.weightBakery,
    weightBeverages: pickup?.["Lbs Beverages"] ?? defaultPickup.weightBeverages,
    weightDairy: pickup?.["Lbs Dairy"] ?? defaultPickup.weightDairy,
    weightDry: pickup?.["Lbs Dry"] ?? defaultPickup.weightDry,
    weightFrozen: pickup?.["Lbs Frozen"] ?? defaultPickup.weightFrozen,
    weightMeat: pickup?.["Lbs Meat"] ?? defaultPickup.weightMeat,
    weightNonFood: pickup?.["Lbs Non-Food"] ?? defaultPickup.weightNonFood,
    weightPrepared: pickup?.["Lbs Prepared"] ?? defaultPickup.weightPrepared,
    weightProduce: pickup?.["Lbs Produce"] ?? defaultPickup.weightProduce,
    frozenTempStart:
      pickup?.["Frozen Temp Start"] ?? defaultPickup.frozenTempStart,
    frozenTempEnd: pickup?.["Frozen Temp End"] ?? defaultPickup.frozenTempEnd,
    refrigeratedTempStart:
      pickup?.["Refrigerated Temp Start"] ??
      defaultPickup.refrigeratedTempStart,
    refrigeratedTempEnd:
      pickup?.["Refrigerated Temp Start"] ?? defaultPickup.refrigeratedTempEnd,
  };
}

// Assuming all pickup operations occur in PST
function toPickupDate(pastDate = Date.now()) {
  const date = new Date(pastDate);
  const offset = date.getTimezoneOffset();
  const myDate = new Date(date.getTime() - offset * 60 * 1000);
  return myDate.toISOString().split("T")[0];
}

export default router;
