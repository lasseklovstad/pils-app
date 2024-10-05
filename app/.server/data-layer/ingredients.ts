import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { Ingredient, ingredientsTable } from "db/schema";

export const getBatchIngredients = async (batchId: number) => {
  return await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.batchId, batchId));
};

export const postIngredient = async (
  ingredient: Pick<Ingredient, "amount" | "name" | "type" | "batchId">,
) => {
  await db.insert(ingredientsTable).values(ingredient);
};

export const putIngredient = async ({
  id,
  ...ingredient
}: Pick<Ingredient, "amount" | "name" | "type" | "id">) => {
  await db
    .update(ingredientsTable)
    .set(ingredient)
    .where(eq(ingredientsTable.id, id));
};

export const deleteIngredient = async (id: number) => {
  await db.delete(ingredientsTable).where(eq(ingredientsTable.id, id));
};
