import {
  and,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  lt,
  min,
  ne,
  not,
  or,
  sql,
} from "drizzle-orm";

import { db } from "db/config.server";
import { batches, controllerTemperatures } from "db/schema";

export const insertControllerTemperature = async (
  controllerTemperature: Pick<
    typeof controllerTemperatures.$inferInsert,
    "controllerId" | "temperature"
  >,
) => {
  await db.insert(controllerTemperatures).values({
    ...controllerTemperature,
    batchId: sql`${db
      .select({ id: batches.id })
      .from(batches)
      .where(
        and(
          eq(batches.controllerId, controllerTemperature.controllerId),
          not(eq(batches.controllerStatus, "inactive")),
        ),
      )}`,
  });
};

export const getControllerTemperaturesFromBatchId = async (batchId: number) => {
  return await db
    .select({
      ...getTableColumns(controllerTemperatures),
      count: sql<number>`count(*) over()`,
    })
    .from(controllerTemperatures)
    .where(
      and(
        eq(controllerTemperatures.batchId, batchId),
        ne(controllerTemperatures.temperature, 85),
        ne(controllerTemperatures.temperature, -127),
        // Select only every minute
        inArray(
          controllerTemperatures.timestamp,
          db
            .select({ timestamp: min(controllerTemperatures.timestamp) })
            .from(controllerTemperatures)
            .groupBy(sql`${controllerTemperatures.timestamp}/(60)`)
            .orderBy(desc(controllerTemperatures.temperature)),
        ),
      ),
    );
};

export const getControllerTemperaturesFromBatchIdByDay = async (
  batchId: number,
  fromDay: number,
  fromHour: number,
) => {
  return await db
    .select({
      ...getTableColumns(controllerTemperatures),
    })
    .from(controllerTemperatures)
    .innerJoin(batches, eq(batches.id, controllerTemperatures.batchId))
    .where(
      and(
        eq(controllerTemperatures.batchId, batchId),
        ne(controllerTemperatures.temperature, 85),
        ne(controllerTemperatures.temperature, -127),
        gte(
          controllerTemperatures.timestamp,
          sql`unixepoch(datetime(${batches.fermentationStartDate}, 'auto','${sql.raw(`+${fromDay} day`)}', '${sql.raw(`+${fromHour} hour`)}'))`,
        ),
        lt(
          controllerTemperatures.timestamp,
          sql`unixepoch(datetime(${batches.fermentationStartDate}, 'auto','${sql.raw(`+${fromDay} day`)}', '${sql.raw(`+${fromHour + 6} hour`)}'))`,
        ),
      ),
    );
};

export const getControllerTemperatures = async (
  controllerId: number,
  groupBy: string,
) => {
  const groupColumn =
    groupBy === "timestamp"
      ? controllerTemperatures.timestamp
      : sql<number>`${controllerTemperatures.timestamp}/(${(groupBy === "hours" ? 60 * 60 : 60).toString()})`;
  return await db
    .select({
      avgTemp: sql<number>`avg(${controllerTemperatures.temperature})`,
      minTemp: sql<number>`min(${controllerTemperatures.temperature})`,
      maxTemp: sql<number>`max(${controllerTemperatures.temperature})`,
      count: sql<number>`COUNT(*)`,
      timestamp: sql`min(${controllerTemperatures.timestamp})`.mapWith(
        controllerTemperatures.timestamp,
      ),
      groupColumn,
    })
    .from(controllerTemperatures)
    .where(
      and(
        eq(controllerTemperatures.controllerId, controllerId),
        ne(controllerTemperatures.temperature, 85),
        ne(controllerTemperatures.temperature, -127),
      ),
    )
    .limit(250)
    .groupBy(groupColumn)
    .orderBy(desc(controllerTemperatures.timestamp));
};

export const getControllerTemperaturesTotalCount = async (
  controllerId: number,
) => {
  return (
    (
      await db
        .select({
          totalCount: sql<number>`COUNT(*) OVER()`,
        })
        .from(controllerTemperatures)
        .where(eq(controllerTemperatures.controllerId, controllerId))
        .limit(1)
    )[0]?.totalCount ?? 0
  );
};

export const getControllerTemperaturesErrorTotalCount = async (
  controllerId: number,
) => {
  return (
    (
      await db
        .select({
          totalCount: sql<number>`COUNT(*)`,
        })
        .from(controllerTemperatures)
        .where(
          and(
            eq(controllerTemperatures.controllerId, controllerId),
            or(
              eq(controllerTemperatures.temperature, 85),
              eq(controllerTemperatures.temperature, -127),
            ),
          ),
        )
        .limit(1)
    )[0]?.totalCount ?? 0
  );
};

export const getLatestControllerTemperature = async (controllerId: number) => {
  return (
    await db
      .select()
      .from(controllerTemperatures)
      .where(eq(controllerTemperatures.controllerId, controllerId))
      .limit(1)
      .orderBy(desc(controllerTemperatures.timestamp))
  )[0];
};
