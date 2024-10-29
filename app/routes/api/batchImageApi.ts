import { LocalFileStorage } from "@mjackson/file-storage/local";

import type { LoaderArgs } from "./+types.batchImageApi";

import { getBatchFile } from "~/.server/data-layer/batchFiles";

export const loader = async ({ params }: LoaderArgs) => {
  const batchFile = await getBatchFile(params.fileId);
  if (!batchFile) {
    return new Response("Not found", { status: 404 });
  }
  const directory = `${process.env.MEDIA_DIRECTORY}/media/batch-${batchFile.batchId}`;
  const fileStorage = new LocalFileStorage(directory);
  const file = await fileStorage.get(batchFile.id);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }
  const headers = {
    "Content-Type": file.type,
    "Content-Length": file.size.toString(),
    "Cache-Control": "public, max-age=15552000",
  };
  return new Response(file.stream(), { headers });
};
