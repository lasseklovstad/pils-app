import { z } from "zod";
export const uploadFilesIntent = "upload-media";
export const UploadFilesSchema = z.object({
  intent: z.literal(uploadFilesIntent),
  media: z.array(z.instanceof(File)),
});

export const setPreviewFileIntent = "set-preview-file";
export const SetPreviewFileSchema = z.object({
  intent: z.literal(setPreviewFileIntent),
  fileId: z.string(),
});

export const deleteFileIntent = "delete-file";
export const DeleteFileSchema = z.object({
  intent: z.literal(deleteFileIntent),
  fileId: z.string(),
});
