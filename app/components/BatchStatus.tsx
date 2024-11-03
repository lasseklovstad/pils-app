import { Check, Dot, X } from "lucide-react";

type Props = {
  status: "active" | "inactive" | "prepare";
};

export const BatchStatus = ({ status }: Props) => {
  if (status === "active") {
    return <Check className="size-6 text-green-500" />;
  }
  if (status === "inactive") {
    return <X className="size-6 text-gray-500" />;
  }
  return <Dot className="size-6 stroke-[10] text-orange-500" />;
};
