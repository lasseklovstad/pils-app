import { useId } from "react";
import { Form } from "react-router";

type Props = {
  readOnly: boolean;
  controllers: {
    id: number;
    name: string;
  }[];
  controllerId: string | null;
  mode: string | null;
};

export const ControllerForm = ({
  controllerId,
  controllers,
  readOnly,
  mode,
}: Props) => {
  const controllerSelectId = useId();
  const modeSelectId = useId();
  return (
    <Form method="PUT" className="flex gap-2">
      <div className="flex flex-col items-start gap-2">
        <label htmlFor={controllerSelectId}>Velg kontroller</label>
        <select
          id={controllerSelectId}
          className="rounded border p-1 pr-1"
          value={controllerId ?? ""}
          name="controllerId"
          onChange={(e) => e.target.form?.requestSubmit()}
          disabled={readOnly}
        >
          <option value="">Ingen valgt</option>
          {controllers.map((controller) => (
            <option key={controller.id} value={controller.id}>
              {controller.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col items-start gap-2">
        <label htmlFor={modeSelectId}>Velg type</label>
        <select
          id={modeSelectId}
          className="rounded border p-1 pr-1"
          value={mode ?? ""}
          name="controllerMode"
          onChange={(e) => e.target.form?.requestSubmit()}
          disabled={readOnly}
        >
          <option value="">Ingen valgt</option>
          <option value="warm">Varmeovn</option>
          <option value="cold">Kjøleskap</option>
        </select>
      </div>

      <input hidden name="intent" value="put-batch-controller" />
    </Form>
  );
};
