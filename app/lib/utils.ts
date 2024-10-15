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
