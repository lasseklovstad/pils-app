import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { Ingredient, ingredients } from "db/schema";

export const getBatchIngredients = async (batchId: number) => {
  return await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.batchId, batchId));
};

export const postIngredient = async (
  ingredient: Pick<Ingredient, "amount" | "name" | "type" | "batchId">,
) => {
  await db.insert(ingredients).values(ingredient);
};

export const putIngredient = async ({
  id,
  ...ingredient
}: Pick<Ingredient, "amount" | "name" | "type" | "id">) => {
  await db.update(ingredients).set(ingredient).where(eq(ingredients.id, id));
};

export const deleteIngredient = async (id: number) => {
  await db.delete(ingredients).where(eq(ingredients.id, id));
};
