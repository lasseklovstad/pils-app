import os from "os";
import path from "path";

import { LocalFileStorage } from "@mjackson/file-storage/local";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import { Form, useSearchParams } from "react-router";
import QRCode from "qrcode";

import type { Route } from "./+types/BatchDetailsPage";

import { getBatch, putBatch } from "~/.server/data-layer/batches";
import {
  deleteFile,
  getBatchFiles,
  insertFile,
} from "~/.server/data-layer/batchFiles";
import { getBatchTemperatures } from "~/.server/data-layer/batchTemperatures";
import { getControllersFromBatchId } from "~/.server/data-layer/controllers";
import {
  deleteIngredient,
  getBatchIngredients,
  postIngredient,
  putIngredient,
} from "~/.server/data-layer/ingredients";
import { Main } from "~/components/Main";
import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { Input } from "~/components/ui/input";
import { getUser, requireUser } from "~/lib/auth.server";
import { getBatchFileStorage } from "~/lib/batchFileStorage";
import { getControllerTemperaturesFromBatchId } from "~/.server/data-layer/controllerTemperatures";
import { useRevalidateOnFocus } from "~/lib/useRevalidateOnFocus";

import { BatchPreviewImage } from "./shared/BatchPreviewImage";
import { Fermentation } from "./shared/Fermentation";
import { GravityForm } from "./shared/GravityForm";
import { MaltForm } from "./shared/MaltForm";
import { MashingForm } from "./shared/MashingForm";
import { MediaCarousel } from "./shared/MediaCarousel";
import { batchTemperaturesAction } from "./actions/batchTemperatures.server";
import { batchTemperaturesIntent } from "./actions/batchTemperatures.schema";
import { batchControllerStatusIntent } from "./actions/batchController.schema";
import { batchControllerStatusAction } from "./actions/batchController.server";
import { deleteBatchIntent, editBatchNameIntent } from "./actions/batch.schema";
import { deleteBatchAction, editBatchNameAction } from "./actions/batch.server";
import { BatchMenu } from "./shared/BatchMenu";

export const loader = async ({
  request,
  params: { batchId: batchIdParam },
}: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const batchId = parseInt(batchIdParam);
  const [
    batch,
    batchIngredients,
    user,
    batchFiles,
    controllers,
    batchTemperatures,
    controllerTemperatures,
    qrCode,
  ] = await Promise.all([
    getBatch(batchId),
    getBatchIngredients(batchId),
    getUser(request),
    getBatchFiles(batchId),
    getControllersFromBatchId(batchId),
    getBatchTemperatures(batchId),
    getControllerTemperaturesFromBatchId(batchId),
    QRCode.toDataURL(url.origin + url.pathname),
  ]);
  if (!batch) {
    throw new Response("Fant ikke brygg med id " + batchId, { status: 404 });
  }
  return {
    batch,
    batchIngredients,
    user,
    batchFiles,
    controllers,
    batchTemperatures,
    controllerTemperatures,
    qrCode,
  };
};

export const action = async ({
  params: { batchId: batchIdParam },
  request,
}: Route.ActionArgs) => {
  const batchId = parseInt(batchIdParam);
  await requireUserOwnerOfBatch(request, batchId);

  const formData = await parseFormData(
    request,
    createTempUploadHandler("batch-uploads"),
    { maxFileSize: 20 * 1024 * 1024 },
  );
  const intent = String(formData.get("intent"));
  switch (intent) {
    case "upload-media":
      return uploadFilesAction({ formData, batchId });
    case "set-preview-file":
      return setPreviewFileAction({ formData, batchId });
    case "delete-file":
      return deleteFileAction({ formData, batchId });
    case "put-gravity":
      return putGravityAction({ formData, batchId });
    case "put-batch-controller":
      return putBatchControllerAction({ formData, batchId });
    case "put-mashing":
      return putMashingAction({ formData, batchId });
    case "ingredient":
      return ingredientAction({ formData, batchId, request });
    case batchTemperaturesIntent:
      return batchTemperaturesAction({ formData, batchId });
    case batchControllerStatusIntent:
      return batchControllerStatusAction({ formData, batchId });
    case deleteBatchIntent:
      return deleteBatchAction(batchId);
    case editBatchNameIntent:
      return editBatchNameAction({ batchId, formData });
    default: {
      throw new Response(`Invalid intent "${intent}"`, { status: 400 });
    }
  }
};

export default function BatchPage({
  loaderData: {
    batch,
    batchIngredients,
    user,
    batchFiles,
    controllers,
    batchTemperatures,
    controllerTemperatures,
    qrCode,
  },
}: Route.ComponentProps) {
  useRevalidateOnFocus();
  const [searchParams, setSearchParams] = useSearchParams();
  const readOnly = batch.userId !== user?.id;
  const filesToShow = batchFiles.filter((file) => file.type !== "unknown");
  return (
    <Main>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <BatchPreviewImage
            publicUrl={batch.previewFilePublicUrl}
            className="w-16"
          />
          <div>
            <h1 className="text-4xl">{batch.name}</h1>
            <div className="mb-4 text-sm">
              Opprettet:{" "}
              {batch.createdTimestamp.toLocaleDateString("nb", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        {!readOnly ? <BatchMenu batch={batch} /> : null}
      </div>
      <div className="mb-10 flex flex-col gap-2">
        <Accordion
          type="single"
          value={searchParams.get("open") ?? undefined}
          collapsible
          onValueChange={(value) => setSearchParams({ open: value })}
        >
          <AccordionItem value="malt">
            <MaltForm ingredients={batchIngredients} readOnly={readOnly} />
          </AccordionItem>
          <AccordionItem value="mashing">
            <MashingForm
              batch={batch}
              ingredients={batchIngredients}
              readOnly={readOnly}
            />
          </AccordionItem>
          <AccordionItem value="fermentation">
            <Fermentation
              ingredients={batchIngredients}
              readOnly={readOnly}
              controllers={controllers}
              batch={batch}
              batchTemperatures={batchTemperatures}
              controllerTemperatures={controllerTemperatures}
            />
          </AccordionItem>
          <AccordionItem value="gravity">
            <GravityForm batch={batch} readOnly={readOnly} />
          </AccordionItem>
        </Accordion>

        <h2 className="text-2xl">
          Last opp bilder/video ({filesToShow.length})
        </h2>
        {!readOnly ? (
          <Form encType="multipart/form-data" method="POST">
            <Input
              onChange={(e) => e.target.form?.requestSubmit()}
              className="w-fit"
              type="file"
              multiple
              name="media"
              accept="image/*,video/*"
            />
            <input readOnly name="intent" value="upload-media" hidden />
          </Form>
        ) : null}
        {filesToShow.length > 0 ? (
          <MediaCarousel files={filesToShow} showMenu={!readOnly} />
        ) : null}
        <img src={qrCode} className="size-40" />
      </div>
    </Main>
  );
}

async function uploadFilesAction({
  formData,
  batchId,
}: {
  formData: FormData;
  batchId: number;
}) {
  const files = formData.getAll("media") as File[];
  const fileStorage = getBatchFileStorage(batchId);
  for (const file of files) {
    const type = file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("image")
        ? "image"
        : "unknown";
    if (type === "unknown") {
      console.warn("Unknown file tried to upload");
      return;
    }
    const fileId = await insertFile({
      batchId,
      type,
    });
    await fileStorage.set(fileId, file);
  }

  return { status: "success" };
}
async function setPreviewFileAction({
  formData,
  batchId,
}: {
  formData: FormData;
  batchId: number;
}) {
  const previewFileId = String(formData.get("fileId"));
  await putBatch(batchId, { previewFileId });
  return { status: "success" };
}

async function deleteFileAction({
  formData,
  batchId,
}: {
  formData: FormData;
  batchId: number;
}) {
  const fileId = String(formData.get("fileId"));
  const fileStorage = getBatchFileStorage(batchId);
  await fileStorage.remove(fileId);
  await deleteFile(fileId);
  return { status: "success" };
}

async function putGravityAction({
  formData,
  batchId,
}: {
  formData: FormData;
  batchId: number;
}) {
  const originalGravity = parseInt(String(formData.get("original-gravity")));
  const finalGravity = parseInt(String(formData.get("final-gravity")));
  await putBatch(batchId, { originalGravity, finalGravity });
  return { status: "success" };
}

async function putBatchControllerAction({
  formData,
  batchId,
}: {
  formData: FormData;
  batchId: number;
}) {
  const controllerId = parseInt(String(formData.get("controllerId")));
  const mode = String(formData.get("controllerMode")) as "warm" | "cold" | "";
  await putBatch(batchId, {
    controllerId: controllerId || null,
    mode: mode || null,
  });
  return { status: "success" };
}

async function putMashingAction({
  formData,
  batchId,
}: {
  formData: FormData;
  batchId: number;
}) {
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
  return { status: "success" };
}

async function ingredientAction({
  formData,
  batchId,
  request,
}: {
  formData: FormData;
  batchId: number;
  request: Request;
}) {
  if (request.method === "DELETE") {
    const id = parseInt(String(formData.get("id")));
    await deleteIngredient(id);
    return { status: "success" };
  }
  const name = String(formData.get("name"));
  const type = String(formData.get("type"));
  const amount = parseFloat(String(formData.get("amount")));
  if (type !== "malt" && type !== "yeast") {
    throw new Error("Invalid ingredient type");
  }
  if (request.method === "POST") {
    await postIngredient({ name, type, batchId, amount });
    return { status: "success" };
  }
  if (request.method === "PUT") {
    const id = parseInt(String(formData.get("id")));
    await putIngredient({ name, type, amount, id });
    return { status: "success" };
  }
}

function createTempUploadHandler(prefix: string) {
  const directory = path.join(os.tmpdir(), prefix);
  const fileStorage = new LocalFileStorage(directory);

  async function uploadHandler(fileUpload: FileUpload) {
    if (fileUpload.fieldName === "media") {
      const key = new Date().getTime().toString(36);
      await fileStorage.set(key, fileUpload);
      return fileStorage.get(key);
    }

    // Ignore any files we don't recognize the name of...
  }
  return uploadHandler;
}

async function requireUserOwnerOfBatch(request: Request, batchId: number) {
  const currentUser = await requireUser(request);
  const batch = await getBatch(batchId);
  if (batch?.userId !== currentUser.id) {
    throw new Response("Unauthorized", { status: 403 });
  }
  return currentUser;
}
