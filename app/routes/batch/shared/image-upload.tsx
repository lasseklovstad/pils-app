import { Info } from "lucide-react";
import { href, Link, useFetcher } from "react-router";

import type { loader } from "~/routes/api/image-sas-token-api";
import type { action } from "../BatchDetailsPage";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type Props = {
  batchId: number;
};

export const ImageUpload = ({ batchId }: Props) => {
  const fetcher = useFetcher<typeof action>();

  async function uploadNewBlob(
    file: File,
    { token, id }: { token: string; id: string },
  ) {
    const res = await fetch(token, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });
    if (res.status === 409) {
      throw new Error("Blob already exists (conflict).");
    }
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
    }
    return { id, type: file.type.toString() };
  }

  const uploadFiles = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const uploadedFiles: { id: string; type: string }[] = [];
      const formData = new FormData();
      const response = await fetch(
        href("/api/image-sas-token") +
          "?" +
          new URLSearchParams({
            batchId: batchId.toString(),
            numberOfFiles: files.length.toString(),
          }).toString(),
      );
      const sasTokens = (await response.json()) as unknown as Awaited<
        ReturnType<typeof loader>
      >;
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files.item(i);
          const token = sasTokens[i];
          if (!token) {
            throw new Error("Could not find token");
          }
          if (!file) {
            throw new Error("Could not find file");
          }
          const uploadResponse = await uploadNewBlob(file, token);
          uploadedFiles.push(uploadResponse);
        } catch (e: unknown) {
          console.error(e);
        }
      }
      if (uploadedFiles.length === 0) return;
      uploadedFiles.forEach((file, index) => {
        formData.append(`files[${index}].id`, file.id);
        formData.append(`files[${index}].type`, file.type);
      });
      formData.set("intent", "upload-media");
      await fetcher.submit(formData, { method: "POST" });
    }
  };

  return (
    <div>
      <Input
        onChange={(event) => {
          const files = event.target.files;
          void uploadFiles(files).then(() => (event.target.value = ""));
        }}
        className="w-fit"
        type="file"
        multiple
        name="media"
        accept="image/*"
      />
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
    </div>
  );
};
