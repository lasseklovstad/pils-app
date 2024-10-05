import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getBatch, putBatch } from "~/.server/data-layer/batches";
import { Main } from "~/components/Main";
import {
  deleteIngredient,
  getBatchIngredients,
  postIngredient,
  putIngredient,
} from "~/.server/data-layer/ingredients";

import { GravityForm } from "./GravityForm";
import { MaltForm } from "./MaltForm";
import { MashingForm } from "./MashingForm";

export const loader = async ({
  params: { batchId: batchIdParam },
}: LoaderFunctionArgs) => {
  const batchId = parseInt(batchIdParam!);
  const [batch, batchIngredients] = await Promise.all([
    getBatch(batchId),
    getBatchIngredients(batchId),
  ]);
  if (!batch) throw new Error("Fant ikke brygg med id " + batchId);
  return { batch, batchIngredients };
};

export const action = async ({
  params: { batchId: batchIdParam },
  request,
}: ActionFunctionArgs) => {
  const batchId = parseInt(batchIdParam!);
  const formData = await request.formData();
  const intent = String(formData.get("intent"));
  if (intent === "put-gravity") {
    const originalGravity = parseInt(String(formData.get("original-gravity")));
    const finalGravity = parseInt(String(formData.get("final-gravity")));
    await putBatch(batchId, { originalGravity, finalGravity });
    return { ok: true };
  }
  if (intent === "put-mashing") {
    const mashingStrikeWaterVolume = parseInt(
      String(formData.get("mashing-strike-water-volume")),
    );
    const mashingTemperature = parseInt(
      String(formData.get("mashing-temperature")),
    );
    const mashingMaltTemperature = parseInt(
      String(formData.get("mashing-malt-temperature")),
    );
    await putBatch(batchId, {
      mashingStrikeWaterVolume,
      mashingTemperature,
      mashingMaltTemperature,
    });
    return { ok: true };
  }
  if (intent === "ingredient") {
    if (request.method === "DELETE") {
      const id = parseInt(String(formData.get("id")));
      await deleteIngredient(id);
      return { ok: true };
    }
    const name = String(formData.get("name"));
    const type = String(formData.get("type"));
    const amount = parseFloat(String(formData.get("amount")));
    if (type !== "malt") {
      throw new Error("Invalid ingredient type");
    }
    if (request.method === "POST") {
      await postIngredient({ name, type, batchId, amount });
      return { ok: true };
    }
    if (request.method === "PUT") {
      const id = parseInt(String(formData.get("id")));
      await putIngredient({ name, type, amount, id });
      return { ok: true };
    }
  }
  throw new Error("Invalid intent");
};

export default function BatchPage() {
  const { batch, batchIngredients } = useLoaderData<typeof loader>();

  return (
    <Main>
      <h1 className="text-4xl">{batch.name}</h1>
      <div className="mb-4 text-sm">
        Opprettet: {batch.createdTimestamp.toLocaleDateString("nb")}{" "}
        {batch.createdTimestamp.toLocaleTimeString("nb")}
      </div>
      <div className="flex flex-col gap-2">
        <MaltForm ingredients={batchIngredients} />
        <MashingForm batch={batch} ingredients={batchIngredients} />

        <GravityForm batch={batch} />
      </div>
    </Main>
  );
}
