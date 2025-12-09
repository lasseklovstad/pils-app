import { createBlobSas } from "~/lib/azure.server";
import type { Route } from "./+types/image-sas-token-api";
import { z } from "zod";
import { requireUser } from "~/lib/auth.server";
import { getBatch } from "~/.server/data-layer/batches";

const expireInMin = 1;
const expireInMs = expireInMin * 60 * 1000;

export const loader = async ({ request }: Route.LoaderArgs) => {
    const searchParams = new URL(request.url).searchParams
    const batchId = z.coerce.number().parse(searchParams.get("batchId"))
    const numberOfFiles = z.coerce.number().parse(searchParams.get("numberOfFiles"))
    await requireUserOwnerOfBatch(request, batchId);

    return Promise.all(
        Array({ length: numberOfFiles }).map(async () => {
            const id = crypto.randomUUID()
            return {
                id,
                token: await createBlobSas({
                    accountKey: process.env.AZURE_BLOB_KEY!,
                    accountName: process.env.AZURE_BLOB_NAME!,
                    containerName: "pils",
                    blobName: `batch/${batchId}/${id}`,
                    permissions: "c", // create, no overwrite
                    expiresOn: new Date(new Date().valueOf() + expireInMs),
                    protocol: "https",
                })
            }
        })
    )
};

async function requireUserOwnerOfBatch(request: Request, batchId: number) {
    const currentUser = await requireUser(request);
    const batch = await getBatch(batchId);
    if (batch?.userId !== currentUser.id) {
        throw new Response("Unauthorized", { status: 403 });
    }
    return currentUser;
}