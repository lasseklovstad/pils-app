import { LocalFileStorage } from "@mjackson/file-storage/local";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import { Form } from "react-router";

import type {
  ActionArgs,
  ComponentProps,
  LoaderArgs,
} from "./+types.BatchDetailsPage";

import { getBatch, putBatch } from "~/.server/data-layer/batches";
import { getBatchFiles, insertFile } from "~/.server/data-layer/batchFiles";
import {
  deleteIngredient,
  getBatchIngredients,
  postIngredient,
  putIngredient,
} from "~/.server/data-layer/ingredients";
import { Main } from "~/components/Main";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Input } from "~/components/ui/input";
import { getUser, requireUser } from "~/lib/auth.server";

import { GravityForm } from "./shared/GravityForm";
import { MaltForm } from "./shared/MaltForm";
import { MashingForm } from "./shared/MashingForm";
import { Media } from "./shared/Media";

export const loader = async ({
  request,
  params: { batchId: batchIdParam },
}: LoaderArgs) => {
  const batchId = parseInt(batchIdParam);
  const [batch, batchIngredients, user, batchFiles] = await Promise.all([
    getBatch(batchId),
    getBatchIngredients(batchId),
    getUser(request),
    getBatchFiles(batchId),
  ]);
  if (!batch) {
    throw new Response("Fant ikke brygg med id " + batchId, { status: 404 });
  }
  return {
    batch,
    batchIngredients,
    user,
    batchFiles: batchFiles.map((file) => ({
      ...file,
      publicUrl: `/api/files/${file.type}/${file.id}`,
    })),
  };
};

const requireUserOwnerOfBatch = async (request: Request, batchId: number) => {
  const currentUser = await requireUser(request);
  const batch = await getBatch(batchId);
  if (batch?.userId !== currentUser.id) {
    throw new Response("Unauthorized", { status: 403 });
  }
  return currentUser;
};

export const action = async ({
  params: { batchId: batchIdParam },
  request,
}: ActionArgs) => {
  const batchId = parseInt(batchIdParam);
  await requireUserOwnerOfBatch(request, batchId);

  const formData = await parseFormData(
    request,
    createBatchUploadHandler(batchId),
  );
  const intent = String(formData.get("intent"));
  if (intent === "upload-media") {
    const files = formData.getAll("media") as File[];
    console.log(files.map((file) => file.name));

    return { ok: true };
  }
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

function createBatchUploadHandler(batchId: number) {
  const directory = `${process.env.MEDIA_DIRECTORY}/media/batch-${batchId}`;
  const fileStorage = new LocalFileStorage(directory);

  async function uploadHandler(fileUpload: FileUpload) {
    if (fileUpload.fieldName === "media") {
      const fileId = await insertFile({
        batchId,
        type: fileUpload.type.startsWith("video")
          ? "video"
          : fileUpload.type.startsWith("image")
            ? "image"
            : "unknown",
      });
      await fileStorage.set(fileId, fileUpload);
      return fileStorage.get(fileId);
    }

    // Ignore any files we don't recognize the name of...
  }
  return uploadHandler;
}

export default function BatchPage({
  loaderData: { batch, batchIngredients, user, batchFiles },
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
        <Carousel opts={{ align: "end" }}>
          <CarouselContent>
            {batchFiles
              .filter((file) => file.type !== "unknown")
              .map((file) => (
                <CarouselItem
                  key={file.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Media
                    file={file}
                    className="h-96 w-full rounded-sm object-cover object-center"
                  />
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </Main>
  );
}
