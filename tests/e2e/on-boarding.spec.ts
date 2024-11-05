import { faker } from "@faker-js/faker";

import { getEmailContentAsText, readEmail } from "tests/mocks/utils";
import { expect, test } from "tests/playwright-utils";

const URL_REGEX = /(?<url>https?:\/\/[^\s$.?#].[^\s]*)/;
const CODE_REGEX = /Her er koden: (?<code>[\d\w]+)/;
function extractUrl(text: string) {
  const match = text.match(URL_REGEX);
  return match?.groups?.url;
}
function extractCode(text: string) {
  const codeMatch = text.match(CODE_REGEX);
  return codeMatch?.groups?.code;
}

test("onboarding with code", async ({ page }) => {
  await page.goto("/");
  const mockEmail = faker.internet.email();
  const mockPassword = faker.internet.password();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Pils/);
  await page.getByRole("link", { name: "Logg inn" }).click();
  await page.getByRole("link", { name: "Registrer deg her" }).click();
  await expect(
    page.getByRole("heading", { name: "Lag ny bruker" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "E-post" }).fill(mockEmail);
  await page.getByRole("button", { name: "Send inn" }).click();
  await expect(
    page.getByRole("heading", { name: "Sjekk din mail" }),
  ).toBeVisible();
  const email = await readEmail(mockEmail);
  if (!email) {
    throw new Error("Could not find email");
  }
  expect(email.from.email).toBe("pils.admin@gataersamla.no");
  const emailText = getEmailContentAsText(email.content);
  if (!emailText?.value) {
    throw new Error("Could not find email text content");
  }
  const code = extractCode(emailText.value);
  await page.getByRole("textbox", { name: "Kode" }).fill(code!);
  await page.getByRole("button", { name: "Send inn" }).click();
  await expect(
    page.getByRole("heading", { name: "Velkommen " + mockEmail }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Navn" })
    .fill(faker.person.fullName());
  await page
    .getByRole("textbox", { name: "Passord", exact: true })
    .fill(mockPassword);
  await page
    .getByRole("textbox", { name: "Bekreft passord" })
    .fill(mockPassword);
  await page.getByLabel(/vilkår/i).check();

  await page.getByLabel(/husk meg/i).check();

  await page.getByRole("button", { name: /Opprett bruker/i }).click();
  await expect(page.getByRole("button", { name: "Logg ut" })).toBeVisible();
});

test("onboarding with link", async ({ page }) => {
  await page.goto("/");
  const mockEmail = faker.internet.email();
  const mockPassword = faker.internet.password();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Pils/);
  await page.getByRole("link", { name: "Logg inn" }).click();
  await page.getByRole("link", { name: "Registrer deg her" }).click();
  await expect(
    page.getByRole("heading", { name: "Lag ny bruker" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "E-post" }).fill(mockEmail);
  await page.getByRole("button", { name: "Send inn" }).click();
  await expect(
    page.getByRole("heading", { name: "Sjekk din mail" }),
  ).toBeVisible();
  const email = await readEmail(mockEmail);
  if (!email) {
    throw new Error("Could not find email");
  }
  expect(email.from.email).toBe("pils.admin@gataersamla.no");
  const emailText = getEmailContentAsText(email.content);
  if (!emailText?.value) {
    throw new Error("Could not find email text content");
  }
  const onboardingUrl = extractUrl(emailText.value);
  await page.goto(onboardingUrl!);
  await page.getByRole("button", { name: "Send inn" }).click();
  await expect(
    page.getByRole("heading", { name: "Velkommen " + mockEmail }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Navn" })
    .fill(faker.person.fullName());
  await page
    .getByRole("textbox", { name: "Passord", exact: true })
    .fill(mockPassword);
  await page
    .getByRole("textbox", { name: "Bekreft passord" })
    .fill(mockPassword);
  await page.getByLabel(/vilkår/i).check();

  await page.getByLabel(/husk meg/i).check();

  await page.getByRole("button", { name: /Opprett bruker/i }).click();
  await expect(page.getByRole("button", { name: "Logg ut" })).toBeVisible();
});

test("login as existing user", async ({ page, insertNewUser }) => {
  const user = await insertNewUser();
  await page.goto("/login");
  await page.getByRole("textbox", { name: "E-post" }).fill(user.email);
  await page.getByLabel("Passord").fill(user.password);
  await page.getByRole("button", { name: "Logg inn" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Logg ut" })).toBeVisible();
});
