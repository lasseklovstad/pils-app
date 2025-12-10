import * as crypto from "node:crypto";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Ingredient } from "db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const filterIngredients = (
  ingredients: Ingredient[],
  type: Ingredient["type"],
) => {
  return ingredients.filter((i) => i.type === type);
};

export const calculateTotalAmount = (ingredients: Ingredient[]) => {
  return ingredients.reduce((acc, current) => acc + current.amount, 0);
};

type CalculateWaterTemperatureProps = {
  finalTemp: number;
  maltTemp: number;
  waterMass: number;
  maltMass: number;
};

const specificHeatMalt = 0.38;

export function calculateWaterTemperature({
  finalTemp,
  maltMass,
  maltTemp,
  waterMass,
}: CalculateWaterTemperatureProps): number {
  // Convert water and malt masses to grams
  const waterMassGrams = waterMass * 1000; // Water mass in grams
  const maltMassGrams = maltMass * 1000; // Malt mass in grams

  // Formula to calculate the water temperature
  const waterTemp =
    (finalTemp * (waterMassGrams + specificHeatMalt * maltMassGrams) -
      maltTemp * specificHeatMalt * maltMassGrams) /
    waterMassGrams;

  return waterTemp;
}

export function createControllerSecret() {
  const secret = crypto.randomBytes(32).toString("hex");
  return secret;
}

export function encryptSecret(secret: string, encryptionKeyHex: string) {
  const encryptionKey = Buffer.from(encryptionKeyHex, "hex");
  // Initialization vector (IV) - can be random but must be saved with the encrypted secret
  const iv = crypto.randomBytes(16); // AES uses a 16-byte IV

  // Encrypt the secret using AES-256-CBC
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Store the IV and the encrypted secret in the database (you need both)
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptSecret(storedSecret: string, encryptionKeyHex: string) {
  const encryptionKey = Buffer.from(encryptionKeyHex, "hex");
  // Split the storedSecret to get the IV and the encrypted data
  const parts = storedSecret.split(":");
  if (!parts[0] || !parts[1]) {
    throw new Error("Encrypted key has wrong format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const encryptedSecret = parts[1];

  // Decrypt the secret using AES-256-CBC
  const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
  let decrypted = decipher.update(encryptedSecret, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const protocol = request.headers.get("X-Forwarded-Proto") ?? "http";
  return `${protocol}://${host}`;
}

export const transformCloudflare = (url: string) => {
  return `https://gataersamla.no/cdn-cgi/image/width=800,format=auto/${url}`
}
