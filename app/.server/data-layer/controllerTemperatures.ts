import { desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { controllerTemperaturesTable } from "db/schema";

export const postControllerTemperature = async (
  controllerTemperature: typeof controllerTemperaturesTable.$inferInsert,
) => {
  await db.insert(controllerTemperaturesTable).values(controllerTemperature);
};

export const getControllerTemperatures = async (controllerId: number) => {
  return await db
    .select({
      ...getTableColumns(controllerTemperaturesTable),
      totalCount: sql<number>`COUNT(*) OVER()`,
    })
    .from(controllerTemperaturesTable)
    .where(eq(controllerTemperaturesTable.controllerId, controllerId))
    .limit(1000)
    .orderBy(desc(controllerTemperaturesTable.timestamp));
};
