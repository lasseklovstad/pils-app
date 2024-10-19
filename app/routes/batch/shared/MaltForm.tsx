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
};
const type = "malt";
const amountUnit = "kg";
export const MaltForm = ({ ingredients }: Props) => {
  const maltIngredients = filterIngredients(ingredients, "malt");
  const totalAmount = calculateTotalAmount(maltIngredients);
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          Malt ({totalAmount}
          {amountUnit})
        </AccordionTrigger>
        <AccordionContent>
          <ul className="divide-y">
            <li>
              <IngredientForm
                type={type}
                amountUnit={amountUnit}
                showLabel={true}
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
                  />
                </li>
              );
            })}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
