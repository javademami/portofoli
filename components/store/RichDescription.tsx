type Block =
  | { type: "text"; value: string }
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flush = () => {
    const value = buf.join("\n").trim();
    if (value) blocks.push({ type: "text", value });
    buf = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const img = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
    const vid = line.match(/^\[video\]\((https?:\/\/[^\s)]+)\)$/);
    if (img) {
      flush();
      blocks.push({ type: "image", alt: img[1], src: img[2] });
    } else if (vid) {
      flush();
      blocks.push({ type: "video", src: vid[1] });
    } else {
      buf.push(raw);
    }
  }
  flush();
  return blocks;
}

function embedUrl(src: string): string | null {
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = src.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export default function RichDescription({ text }: { text: string }) {
  const blocks = parse(text);
  return (
    <div className="space-y-4 text-white/70">
      {blocks.map((b, i) => {
        if (b.type === "text") {
          return (
            <p key={i} className="whitespace-pre-line">
              {b.value}
            </p>
          );
        }
        if (b.type === "image") {
          return (
            <img
              key={i}
              src={b.src}
              alt={b.alt}
              loading="lazy"
              className="w-full rounded-2xl border border-white/10"
            />
          );
        }
        const embed = embedUrl(b.src);
        if (embed) {
          return (
            <div key={i} className="aspect-video overflow-hidden rounded-2xl border border-white/10">
              <iframe
                src={embed}
                title="video"
                className="h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <video key={i} src={b.src} controls className="w-full rounded-2xl border border-white/10" />
        );
      })}
    </div>
  );
}