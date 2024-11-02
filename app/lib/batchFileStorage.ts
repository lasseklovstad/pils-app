import { LocalFileStorage } from "@mjackson/file-storage/local";

export const getBatchFileStorage = (batchId: number) => {
  const directory = `${process.env.MEDIA_DIRECTORY}/media/batch-${batchId}`;
  return new LocalFileStorage(directory);
};
