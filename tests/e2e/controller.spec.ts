import { expect, test } from "tests/playwright-utils";

test("Logged in user should be able to create a controller", async ({
  page,
  login,
}) => {
  await login();
  await page.goto("/controller");
  await page.getByRole("textbox", { name: "Navn på kontroller" }).fill("ESP32");
  await page.getByRole("button", { name: "Opprett" }).click();
  await expect(page.getByText("Suksess")).toBeVisible();
});
