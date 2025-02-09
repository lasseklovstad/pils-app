import os from "os";
import path from "path";

import { parseWithZod } from "@conform-to/zod";
import { LocalFileStorage } from "@mjackson/file-storage/local";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import { Info } from "lucide-react";
import QRCode from "qrcode";
import { Form, Link, useSearchParams } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/BatchDetailsPage";

import { getBatch } from "~/.server/data-layer/batches";
import { getBatchFiles } from "~/.server/data-layer/batchFiles";
import { getBatchTemperatures } from "~/.server/data-layer/batchTemperatures";
import { getControllersFromBatchId } from "~/.server/data-layer/controllers";
import { getControllerTemperaturesFromBatchId } from "~/.server/data-layer/controllerTemperatures";
import { getBatchIngredients } from "~/.server/data-layer/ingredients";
import { Main } from "~/components/Main";
import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getUser, requireUser } from "~/lib/auth.server";
import { useRevalidateOnFocus } from "~/lib/useRevalidateOnFocus";

import {
  deleteBatchIntent,
  DeleteBatchSchema,
  deleteIngredientIntent,
  DeleteIngredientSchema,
  editBatchNameIntent,
  EditBatchNameSchema,
  postIngredientIntent,
  PostIngredientSchema,
  putGravityIntent,
  PutGravitySchema,
  putIngredientIntent,
  PutIngredientSchema,
  putMashingNameIntent,
  PutMashingSchema,
} from "./actions/batch.schema";
import {
  deleteBatchAction,
  deleteIngredientAction,
  editBatchNameAction,
  postIngredientAction,
  putGravityAction,
  putIngredientAction,
  putMashingAction,
} from "./actions/batch.server";
import {
  batchControllerStatusIntent,
  BatchControllerStatusSchema,
  putBatchControllerIntent,
  PutBatchControllerSchema,
} from "./actions/batchController.schema";
import {
  batchControllerStatusAction,
  putBatchControllerAction,
} from "./actions/batchController.server";
import {
  batchTemperaturesIntent,
  BatchTemperaturesSchema,
} from "./actions/batchTemperatures.schema";
import { batchTemperaturesAction } from "./actions/batchTemperatures.server";
import {
  deleteFileIntent,
  DeleteFileSchema,
  setPreviewFileIntent,
  SetPreviewFileSchema,
  uploadFilesIntent,
  UploadFilesSchema,
} from "./actions/file.schema";
import {
  deleteFileAction,
  setPreviewFileAction,
  uploadFilesAction,
} from "./actions/files.server";
import { BatchMenu } from "./shared/BatchMenu";
import { BatchPreviewImage } from "./shared/BatchPreviewImage";
import { Fermentation } from "./shared/Fermentation";
import { GravityForm } from "./shared/GravityForm";
import { MaltForm } from "./shared/MaltForm";
import { MashingForm } from "./shared/MashingForm";
import { MediaCarousel } from "./shared/MediaCarousel";

export const meta: Route.MetaFunction = ({ data, error }) => {
  if (error) {
    return [{ title: "Error - Pils" }];
  }
  return [{ title: `${data.batch.name} - Pils` }];
};

export const loader = async ({
  request,
  params: { batchId: batchIdParam },
}: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const isFermentationOpen = url.searchParams.get("open") === "fermentation";
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
    isFermentationOpen ? getControllerTemperaturesFromBatchId(batchId) : [],
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
    { maxFileSize: 20 * 1024 * 1024 },
    createTempUploadHandler("batch-uploads"),
  );
  const schema = z.union([
    PutMashingSchema,
    DeleteBatchSchema,
    UploadFilesSchema,
    SetPreviewFileSchema,
    PutGravitySchema,
    DeleteFileSchema,
    PutBatchControllerSchema,
    BatchTemperaturesSchema,
    BatchControllerStatusSchema,
    EditBatchNameSchema,
    PutIngredientSchema,
    PostIngredientSchema,
    DeleteIngredientSchema,
  ]);
  const result = parseWithZod(formData, {
    schema,
  });
  if (result.status !== "success") {
    return { result: result.reply(), status: 400 };
  }
  switch (result.value.intent) {
    case uploadFilesIntent:
      return uploadFilesAction({ formData: result.value, batchId });
    case setPreviewFileIntent:
      return setPreviewFileAction({ formData: result.value, batchId });
    case deleteFileIntent:
      return deleteFileAction({ formData: result.value, batchId });
    case putGravityIntent:
      return putGravityAction({ formData: result.value, batchId });
    case putBatchControllerIntent:
      return putBatchControllerAction({ formData: result.value, batchId });
    case putMashingNameIntent:
      return putMashingAction({ batch: result.value, batchId });
    case putIngredientIntent:
      return putIngredientAction({ formData: result.value });
    case postIngredientIntent:
      await postIngredientAction({ formData: result.value, batchId });
      return { status: 200, result: result.reply({ resetForm: true }) };
    case batchTemperaturesIntent:
      return batchTemperaturesAction({ formData: result.value, batchId });
    case batchControllerStatusIntent:
      return batchControllerStatusAction({ formData, batchId });
    case deleteBatchIntent:
      return deleteBatchAction(batchId);
    case deleteIngredientIntent:
      await deleteIngredientAction(result.value.id);
      return { status: 200, result: result.reply({ resetForm: true }) };
    case editBatchNameIntent:
      await editBatchNameAction({ batchId, formData: result.value });
      return { status: 200, result: result.reply({ resetForm: true }) };
    default:
      throw new Response("Invalid intent", { status: 400 });
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
      <div className="flex items-center justify-between">
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

        <h2 className="text-2xl">Last opp bilder ({filesToShow.length})</h2>
        {!readOnly ? (
          <Form encType="multipart/form-data" method="POST">
            <Input
              onChange={(e) => e.target.form?.requestSubmit()}
              className="w-fit"
              type="file"
              multiple
              name="media"
              accept="image/*"
            />
            <input readOnly name="intent" value="upload-media" hidden />
            <div className="p-2">
              <div className="flex items-center gap-2 text-sm">
                <Info /> Ikke last opp bilder du ikke vil andre skal se.
              </div>
              <Button asChild variant="link" size="sm">
                <Link to="/privacy">
                  Les mer om hvordan din informasjon behandles her.
                </Link>
              </Button>
            </div>
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

function createTempUploadHandler(prefix: string) {
  const directory = path.join(os.tmpdir(), prefix);
  const fileStorage = new LocalFileStorage(directory);

  async function uploadHandler(fileUpload: FileUpload) {
    if (
      fileUpload.fieldName === "media" &&
      fileUpload.type.startsWith("image/")
    ) {
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
