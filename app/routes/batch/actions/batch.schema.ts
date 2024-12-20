import { z } from "zod";

const BatchNameSchema = z.string().trim().min(1);

export const createBatchIntent = "create-batch";
export const CreateBatchSchema = z.object({
  intent: z.literal(createBatchIntent),
  name: BatchNameSchema,
});

export const editBatchNameIntent = "edit-batch";
export const EditBatchNameSchema = z.object({
  intent: z.literal(editBatchNameIntent),
  name: BatchNameSchema,
});

export const deleteIngredientIntent = "delete-ingredient";
export const DeleteIngredientSchema = z.object({
  intent: z.literal(deleteIngredientIntent),
  id: z.number().int(),
});

export const postIngredientIntent = "post-ingredient";
export const PostIngredientSchema = z.object({
  intent: z.literal(postIngredientIntent),
  name: z.string(),
  type: z.enum(["yeast", "malt"], {
    invalid_type_error: "Invalid ingredient type",
  }),
  amount: z.number(),
});
export const putIngredientIntent = "put-ingredient";
export const PutIngredientSchema = z.object({
  intent: z.literal(putIngredientIntent),
  name: z.string(),
  type: z.enum(["yeast", "malt"], {
    invalid_type_error: "Invalid ingredient type",
  }),
  amount: z.number(),
  id: z.number().int(),
});

export const deleteBatchIntent = "delete-batch";
export const DeleteBatchSchema = z.object({
  intent: z.literal(deleteBatchIntent),
});

export const putMashingNameIntent = "put-mashing";
export const PutMashingSchema = z.object({
  intent: z.literal(putMashingNameIntent),
  mashingStrikeWaterVolume: z.number().int(),
  mashingTemperature: z.number(),
  mashingMaltTemperature: z.number(),
});

export const putGravityIntent = "put-gravity";
export const PutGravitySchema = z.object({
  intent: z.literal(putGravityIntent),
  finalGravity: z.number().int(),
  originalGravity: z.number().int(),
});
