import { cn } from "~/lib/utils";

export const Main = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <main className={cn("container mx-auto flex-1 bg-white", className)}>
    {children}
  </main>
);
