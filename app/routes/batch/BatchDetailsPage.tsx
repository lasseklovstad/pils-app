import type {
  ActionArgs,
  ComponentProps,
  LoaderArgs,
} from "./+types.BatchDetailsPage";

import { getBatch, putBatch } from "~/.server/data-layer/batches";
import { Main } from "~/components/Main";
import {
  deleteIngredient,
  getBatchIngredients,
  postIngredient,
  putIngredient,
} from "~/.server/data-layer/ingredients";
import { getUser, requireUser } from "~/lib/auth.server";

import { MaltForm } from "./shared/MaltForm";
import { MashingForm } from "./shared/MashingForm";
import { GravityForm } from "./shared/GravityForm";

export const loader = async ({
  request,
  params: { batchId: batchIdParam },
}: LoaderArgs) => {
  const batchId = parseInt(batchIdParam);
  const [batch, batchIngredients, user] = await Promise.all([
    getBatch(batchId),
    getBatchIngredients(batchId),
    getUser(request),
  ]);
  if (!batch) {
    throw new Response("Fant ikke brygg med id " + batchId, { status: 404 });
  }
  return { batch, batchIngredients, user };
};

const requireUserOwnerOfBatch = async (request: Request, batchId: number) => {
  const currentUser = await requireUser(request);
  const batch = await getBatch(batchId);
  if (batch?.userId !== currentUser.id) {
    throw new Response("Unauthorized", { status: 403 });
  }
};

export const action = async ({
  params: { batchId: batchIdParam },
  request,
}: ActionArgs) => {
  const batchId = parseInt(batchIdParam);
  await requireUserOwnerOfBatch(request, batchId);
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

export default function BatchPage({
  loaderData: { batch, batchIngredients, user },
}: ComponentProps) {
  const readOnly = batch.userId !== user?.id;
  return (
    <Main>
      <h1 className="text-4xl">{batch.name}</h1>
      <div className="mb-4 text-sm">
        Opprettet: {batch.createdTimestamp.toLocaleDateString("nb")}{" "}
        {batch.createdTimestamp.toLocaleTimeString("nb")}
      </div>
      <div className="mb-10 flex flex-col gap-2">
        <MaltForm ingredients={batchIngredients} readOnly={readOnly} />
        <MashingForm
          batch={batch}
          ingredients={batchIngredients}
          readOnly={readOnly}
        />
        <GravityForm batch={batch} readOnly={readOnly} />
      </div>
    </Main>
  );
}
