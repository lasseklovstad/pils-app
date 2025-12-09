type SASinput = {
    accountKey: string;
    accountName: string;
    containerName: string;
    blobName?: string;
    permissions: string;
    expiresOn: Date;
    startsOn?: Date;
    identifier?: string;
    ipRange?: string;
    protocol?: string;
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLanguage?: string;
    contentType?: string;
};

const truncatedISO8061Date = (date: Date) => {
    const dateString = date.toISOString();

    return dateString.substring(0, dateString.length - 5) + "Z";
};

const computeHMACSHA256 = async (
    stringToSign: string,
    accountKey: string,
): Promise<string> => {
    const enc = new TextEncoder();
    const signatureUTF8 = enc.encode(stringToSign);
    const rawKey = Uint8Array.from(atob(accountKey), (c) => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        "raw",
        rawKey,
        {
            name: "HMAC",
            hash: { name: "SHA-256" },
        },
        false,
        ["sign"],
    );
    const digest = await crypto.subtle.sign("HMAC", key, signatureUTF8);

    return btoa(String.fromCharCode(...new Uint8Array(digest)));
};

const getCanonicalName = (
    accountName: string,
    containerName: string,
    blobName?: string,
) => {
    const elements: string[] = [`/blob/${accountName}/${containerName}`];
    if (blobName) {
        elements.push(`/${blobName}`);
    }
    return elements.join("");
};

const getSASqueryParams = async (input: SASinput) => {
    const resource = input.blobName ? "b" : "c";
    const version = "2020-12-06";
    const signedSnapshotTime = ""; // leave blank unless targeting a snapshot
    const signedEncryptionScope = "";

    const queryParams: Record<string, string> = {
        sp: input.permissions,
        st: input.startsOn ? truncatedISO8061Date(input.startsOn) : "",
        se: truncatedISO8061Date(input.expiresOn),
        name: getCanonicalName(
            input.accountName,
            input.containerName,
            input.blobName,
        ),
        si: input.identifier ?? "",
        sip: input.ipRange ?? "",
        spr: input.protocol ?? "",
        sv: version,
        sr: resource,
        ses: signedEncryptionScope,
        rscc: input.cacheControl ?? "",
        rscd: input.contentDisposition ?? "",
        rsce: input.contentEncoding ?? "",
        rscl: input.contentLanguage ?? "",
        rsct: input.contentType ?? "",
    };

    // Order matches Azure spec for service SAS (Blob) 2020-12-06
    const stringToSign = [
        queryParams.sp,
        queryParams.st,
        queryParams.se,
        queryParams.name,
        queryParams.si,
        queryParams.sip,
        queryParams.spr,
        queryParams.sv,
        queryParams.sr,
        signedSnapshotTime, // blank line if no snapshot
        queryParams.ses, // encryption scope (blank if unused)
        queryParams.rscc,
        queryParams.rscd,
        queryParams.rsce,
        queryParams.rscl,
        queryParams.rsct,
    ].join("\n");

    const signature = await computeHMACSHA256(stringToSign, input.accountKey);
    // Exclude 'name' (canonicalized resource) from final query params
    const { name, ...rest } = queryParams;

    const finalParams = {
        ...rest,
        sig: signature,
    };

    return Object.entries(finalParams)
        .filter(([, v]) => v !== "")
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&");
};

const createBlobSas = async (input: SASinput) => {
    const url = [input.containerName, input.blobName]
        .filter((el) => el)
        .join("/");
    const storageUri = new URL(
        url,
        `https://${input.accountName}.blob.core.windows.net`,
    );
    const queryParams = await getSASqueryParams(input);

    storageUri.search = queryParams;

    return storageUri.toString();
};

export { createBlobSas };
