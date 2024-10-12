import { and, desc, eq, ne, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { controllerTemperaturesTable } from "db/schema";

export const postControllerTemperature = async (
  controllerTemperature: typeof controllerTemperaturesTable.$inferInsert,
) => {
  await db.insert(controllerTemperaturesTable).values(controllerTemperature);
};

export const getControllerTemperatures = async (
  controllerId: number,
  groupBy: string,
) => {
  const groupColumn =
    groupBy === "timestamp"
      ? controllerTemperaturesTable.timestamp
      : sql<number>`${controllerTemperaturesTable.timestamp}/(${(groupBy === "hours" ? 60 * 60 : 60).toString()})`;
  return await db
    .select({
      avgTemp: sql<number>`avg(${controllerTemperaturesTable.temperature})`,
      minTemp: sql<number>`min(${controllerTemperaturesTable.temperature})`,
      maxTemp: sql<number>`max(${controllerTemperaturesTable.temperature})`,
      count: sql<number>`COUNT(*)`,
      timestamp: sql`min(${controllerTemperaturesTable.timestamp})`.mapWith(
        controllerTemperaturesTable.timestamp,
      ),
      groupColumn,
    })
    .from(controllerTemperaturesTable)
    .where(
      and(
        eq(controllerTemperaturesTable.controllerId, controllerId),
        ne(controllerTemperaturesTable.temperature, 85),
        ne(controllerTemperaturesTable.temperature, -127),
      ),
    )
    .limit(1000)
    .groupBy(groupColumn)
    .orderBy(desc(controllerTemperaturesTable.timestamp));
};

export const getControllerTemperaturesTotalCount = async (
  controllerId: number,
) => {
  return (
    await db
      .select({
        totalCount: sql<number>`COUNT(*) OVER()`,
      })
      .from(controllerTemperaturesTable)
      .where(eq(controllerTemperaturesTable.controllerId, controllerId))
      .limit(1)
  )[0];
};

export const getControllerTemperaturesErrorTotalCount = async (
  controllerId: number,
) => {
  return (
    await db
      .select({
        totalCount: sql<number>`COUNT(*)`,
      })
      .from(controllerTemperaturesTable)
      .where(
        and(
          eq(controllerTemperaturesTable.controllerId, controllerId),
          eq(controllerTemperaturesTable.temperature, 85),
          eq(controllerTemperaturesTable.temperature, -127),
        ),
      )
      .limit(1)
  )[0];
};

export const getLatestControllerTemperature = async (controllerId: number) => {
  return (
    await db
      .select()
      .from(controllerTemperaturesTable)
      .where(eq(controllerTemperaturesTable.controllerId, controllerId))
      .limit(1)
      .orderBy(desc(controllerTemperaturesTable.timestamp))
  )[0];
};
