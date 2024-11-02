import { Ingredient } from "db/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { calculateTotalAmount, filterIngredients } from "~/lib/utils";

import { IngredientForm } from "./IngredientForm";

type Props = {
  ingredients: Ingredient[];
  readOnly: boolean;
};
const type = "malt";
const amountUnit = "kg";
export const MaltForm = ({ ingredients, readOnly }: Props) => {
  const maltIngredients = filterIngredients(ingredients, "malt");
  const totalAmount = calculateTotalAmount(maltIngredients);
  return (
    <>
      <AccordionTrigger>
        Malt ({totalAmount.toFixed(2)}
        {amountUnit})
      </AccordionTrigger>
      <AccordionContent>
        <ul className="divide-y">
          <li>
            <IngredientForm
              type={type}
              amountUnit={amountUnit}
              showLabel={true}
              readOnly={readOnly}
            />
          </li>
          {maltIngredients.map((ingredient) => {
            return (
              <li key={ingredient.id}>
                <IngredientForm
                  ingredient={ingredient}
                  type={type}
                  amountUnit={amountUnit}
                  showLabel={false}
                  readOnly={readOnly}
                />
              </li>
            );
          })}
        </ul>
      </AccordionContent>
    </>
  );
};
