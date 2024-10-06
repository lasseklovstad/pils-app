import { and, desc, eq, getTableColumns, gt, ne, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { controllerTemperaturesTable } from "db/schema";

export const postControllerTemperature = async (
  controllerTemperature: typeof controllerTemperaturesTable.$inferInsert,
) => {
  await db.insert(controllerTemperaturesTable).values(controllerTemperature);
};

export const getControllerTemperatures = async (
  controllerId: number,
  from: Date,
) => {
  return await db
    .select({
      ...getTableColumns(controllerTemperaturesTable),
      totalCount: sql<number>`COUNT(*) OVER()`,
    })
    .from(controllerTemperaturesTable)
    .where(
      and(
        eq(controllerTemperaturesTable.controllerId, controllerId),
        ne(controllerTemperaturesTable.temperature, 85),
        ne(controllerTemperaturesTable.temperature, -127),
        gt(controllerTemperaturesTable.timestamp, from),
      ),
    )
    .limit(1000)
    .orderBy(desc(controllerTemperaturesTable.timestamp));
};
