import { webkit } from "@playwright/test";

(async () => {
   // Launch the WebKit browser
   const browser = await webkit.launch({
      headless: false, // Set to true if you want to run in headless mode
   });

   // Create a new browser context
   const context = await browser.newContext();

   // Create a new page in the context
   const page = await context.newPage();

   // Navigate to a webpage
   await page.goto("http://localhost:3000");

   // Keep the browser open
   // await browser.close(); // Uncomment this line to close the browser when done
})();
