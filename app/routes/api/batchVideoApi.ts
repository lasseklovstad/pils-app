import { LocalFileStorage } from "@mjackson/file-storage/local";

import type { LoaderArgs } from "./+types.batchImageApi";

import { getBatchFile } from "~/.server/data-layer/batchFiles";

export const loader = async ({ params, request }: LoaderArgs) => {
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
  const range = request.headers.get("range");
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = startStr ? parseInt(startStr, 10) : 1;
    const end = endStr ? parseInt(endStr, 10) : file.size - 1;
    const chunkSize = end - start + 1;
    return new Response(file.slice(start, end + 1).stream(), {
      headers: {
        "Content-Type": file.type,
        "Content-Length": chunkSize.toString(),
        "Content-Range": `bytes ${start}-${end}/${file.size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=15552000",
      },
      status: 206,
    });
  }

  return new Response(file.stream(), {
    headers: {
      "Content-Type": file.type,
      "Content-Length": file.size.toString(),
      "Cache-Control": "public, max-age=15552000",
    },
  });
};
