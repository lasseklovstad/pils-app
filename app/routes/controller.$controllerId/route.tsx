import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";

import { controllerTemperaturesTable } from "db/schema";
import { getController } from "~/.server/data-layer/controllers";
import { getControllerTemperatures } from "~/.server/data-layer/controllerTemperatures";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const controllerId = parseInt(params.controllerId!);
  const controller = await getController(controllerId);
  const controllerTemperatures = await getControllerTemperatures(controllerId);
  if (!controller) {
    throw new Response(`Fant ingen kontroller med id ${params.controllerId}`, {
      status: 404,
    });
  }
  return { controller, controllerTemperatures };
};

export default function ControllerPage() {
  const { controller, controllerTemperatures } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  return (
    <Main className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl">{controller.name}</h2>
        <Button onClick={revalidator.revalidate}>Refresh</Button>
      </div>
      <div>Identifikator: {controller.id}</div>
      <h3 className="text-2xl">Målinger ({controllerTemperatures.length})</h3>
      <table>
        <thead>
          <tr>
            <th className="border p-2 text-left font-semibold">Tidspunkt</th>
            <th className="border p-2 text-left font-semibold">Temperatur</th>
          </tr>
        </thead>
        <tbody>
          {controllerTemperatures.map((temperature) => {
            return (
              <tr key={temperature.id}>
                <td className="border p-2">
                  {temperature.timestamp.toLocaleDateString("nb")}{" "}
                  {temperature.timestamp.toLocaleTimeString("nb")}
                </td>
                <td className="border p-2">{temperature.temperature}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Main>
  );
}
