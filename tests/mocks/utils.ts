import path from "node:path";
import { fileURLToPath } from "node:url";

import fsExtra from "fs-extra";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirPath = path.join(__dirname, "..", "fixtures");

async function readFixture(subdir: string, name: string) {
  return fsExtra.readJSON(path.join(fixturesDirPath, subdir, `${name}.json`));
}

async function createFixture(subdir: string, name: string, data: unknown) {
  const dir = path.join(fixturesDirPath, subdir);
  await fsExtra.ensureDir(dir);
  const fileDir = path.join(dir, `./${name}.json`);
  console.log("Writing file to: " + fileDir);
  return fsExtra.writeJSON(fileDir, data);
}

const EmailSchema = z.object({
  personalizations: z.array(
    z.object({
      to: z.array(z.object({ email: z.string() })),
      subject: z.string(),
    }),
  ),
  from: z.object({ email: z.string(), name: z.string() }),
  content: z.array(z.object({ type: z.string(), value: z.string() })),
});

type Email = z.infer<typeof EmailSchema>;

export async function writeEmail(rawEmail: unknown) {
  const email = EmailSchema.parse(rawEmail);
  if (!email.personalizations[0]?.to[0]) {
    throw new Error("Must send to atleast one person");
  }
  await createFixture("email", email.personalizations[0].to[0].email, email);
  return email;
}

export async function readEmail(recipient: string) {
  try {
    const email = await readFixture("email", recipient.toLowerCase());
    return EmailSchema.parse(email);
  } catch (error) {
    console.error(`Error reading email`, error);
    return null;
  }
}

export const getEmailContentAsText = (content: Email["content"]) => {
  return content.find((c) => c.type === "text/plain");
};
