import "dotenv/config";
import { db } from "./config.server";
import { controllers, controllerTemperatures } from "./schema";

const secondsBetweenReadings = 6;
const daysAgo = 8;
export async function seedDb() {
  const [controller] = await db
    .insert(controllers)
    .values({ hashedSecret: "123", name: "Test Controller1234" })
    .returning({ id: controllers.id });

  if (!controller) throw new Error("Feil ved lagring av controller til DB");
  const controllerId = controller.id;
  // Start date, 2 weeks ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const totalReadings = (daysAgo * 24 * 60 * 60) / secondsBetweenReadings; // 14 days worth of readings

  const currentDate = startDate;

  for (let i = 0; i < totalReadings; i++) {
    const temperature = generateRealisticOutdoorTemperature(currentDate);

    await db.insert(controllerTemperatures).values({
      controllerId,
      temperature,
      timestamp: new Date(currentDate),
    });

    // Advance by 2 seconds for each reading
    currentDate.setSeconds(currentDate.getSeconds() + secondsBetweenReadings);
  }
}

function generateRealisticOutdoorTemperature(date: Date): number {
  // Simulate daily temperature fluctuation using sine wave function
  // Morning: ~10°C, Noon: ~25°C, Night: ~15°C

  const hours = date.getUTCHours();
  const dayTemp = 25; // Peak temperature during the day
  const nightTemp = 10; // Minimum temperature at night
  const tempFluctuation = (dayTemp - nightTemp) / 2;

  // Calculate temperature using a basic sine function to simulate daily fluctuation
  const temp =
    nightTemp +
    tempFluctuation +
    tempFluctuation * Math.sin(((hours - 6) / 24) * Math.PI * 2);

  // Add some random noise to simulate real-world conditions
  const noise = (Math.random() - 0.5) * 2; // Random number between -1 and 1
  return Math.round((temp + noise) * 10) / 10; // Round to 1 decimal place
}

seedDb()
  .then(() => console.log("Done seeding"))
  .catch((e) => console.error(e));
