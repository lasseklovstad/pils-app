import { LocalFileStorage } from "@mjackson/file-storage/local";
import sharp from "sharp";

import type { Route } from "./+types/batchImageApi";

import { getBatchFile } from "~/.server/data-layer/batchFiles";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const batchFile = await getBatchFile(params.fileId);
  const url = new URL(request.url);
  const width = url.searchParams.get("w");
  if (!batchFile) {
    return new Response("Not found", { status: 404 });
  }
  const directory = `${process.env.MEDIA_DIRECTORY}/media/batch-${batchFile.batchId}`;
  const fileStorage = new LocalFileStorage(directory);
  const file = await fileStorage.get(batchFile.id);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const imageBuffer = await sharp(await file.arrayBuffer())
    .rotate()
    .resize({ width: width ? parseInt(width, 10) : undefined })
    .jpeg({ quality: 40 })
    .toBuffer();

  const headers = {
    "Content-Type": file.type,
    "Content-Length": imageBuffer.byteLength.toString(),
    "Cache-Control": "public, max-age=15552000",
  };
  return new Response(imageBuffer, { headers });
};
