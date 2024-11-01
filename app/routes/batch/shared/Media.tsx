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
        src={`${file.publicUrl}?w=400`}
        srcSet={[200, 350, 400, 500, 600, 700, 800, 1000, 1200]
          .map(
            (width) => `
          ${file.publicUrl}?w=${width} ${width}w`,
          )
          .join(",")}
        sizes="
          (max-width: 768px) 90vw,  
          500px
          "
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
