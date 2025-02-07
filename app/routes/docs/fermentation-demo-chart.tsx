import { add, sub } from "date-fns";

import type { BatchTemperature, ControllerTemperature } from "db/schema";

import { FermentationChart } from "../batch/shared/fermentation-chart";

let index = 0;

const generateBatchTemperature = (
  batchTemp: Partial<BatchTemperature>,
): BatchTemperature => {
  return {
    id: index++,
    dayIndex: 0,
    temperature: 10,
    batchId: 1,
    ...batchTemp,
  };
};

const now = new Date();

const generateControllerTemperature = (
  controllerTemp: Partial<ControllerTemperature>,
): ControllerTemperature => {
  return {
    id: index++,
    controllerId: 1,
    temperature: 9.8,
    timestamp: now,
    batchId: 1,
    ...controllerTemp,
  };
};

const generateRandomControllerTemperatures = (
  startTemp: number,
  startDay: number,
  endDay: number,
  interval: number = 1, // Interval in hours
): ControllerTemperature[] => {
  const temperatures: ControllerTemperature[] = [];
  let currentTemp = startTemp;
  const startTime = add(now, { days: startDay }); // Convert startDay to a Date

  for (
    let time = startTime;
    time <= add(now, { days: endDay });
    time = add(time, { hours: interval })
  ) {
    currentTemp += (Math.random() - 0.5) * 0.2; // Oscillate randomly up and down within 0.1 degrees

    temperatures.push(
      generateControllerTemperature({
        temperature: currentTemp,
        timestamp: time,
      }),
    );
  }
  return temperatures;
};

export const FermentationDemoChart = () => {
  return (
    <FermentationChart
      batchTemperatures={[
        generateBatchTemperature({ dayIndex: 0, temperature: 10 }),
        generateBatchTemperature({ dayIndex: 3, temperature: 13 }),
        generateBatchTemperature({ dayIndex: 6, temperature: 15 }),
        generateBatchTemperature({ dayIndex: 10, temperature: 4 }),
        generateBatchTemperature({ dayIndex: 14, temperature: 4 }),
      ]}
      controllerTemperatures={[
        ...generateRandomControllerTemperatures(10, -5, -2, 1),
        ...generateRandomControllerTemperatures(13, -2, 0, 1),
      ]}
      fermentationStartDate={sub(now, { days: 5 })}
    />
  );
};
