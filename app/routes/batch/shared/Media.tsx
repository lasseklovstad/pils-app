import { transformCloudflare } from "~/lib/utils";

type Props = {
  file: {
    publicUrl: string;
    type: "image" | "video" | "unknown";
    batchId: number;
    id: string;
    createdAt: Date;
  };
  className?: string;
};

export const Media = ({ file, className }: Props) => {
  if (file.type === "image") {
    return (
      <img
        className={className}
        key={file.id}
        src={transformCloudflare(file.publicUrl)}
      />
    );
  }
  if (file.type === "video") {
    return (
      <video
        key={file.id}
        className={className}
        loop
        playsInline
        preload="metadata"
        controls
      >
        {/* Hack for ios for showing thumbnail: https://forums.developer.apple.com/forums/thread/129377 */}
        <source src={file.publicUrl + "#t=0.1"}></source>
      </video>
    );
  }
  return <div key={file.id}>{file.id}</div>;
};
