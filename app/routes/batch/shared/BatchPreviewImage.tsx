import { cn, transformCloudflare } from "~/lib/utils";

type Props = {
  publicUrl: string | null;
  className?: string;
};

export const BatchPreviewImage = ({ publicUrl, className }: Props) => {
  return (
    <img
      src={
        publicUrl
          ? transformCloudflare(publicUrl)
          : "/android-chrome-192x192.png"
      }
      className={cn("aspect-square w-24 rounded object-cover", className)}
    />
  );
};
