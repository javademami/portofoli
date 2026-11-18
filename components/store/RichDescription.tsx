type Block =
  | { kind: "text"; lines: string[] }
  | { kind: "image"; alt: string; src: string }
  | { kind: "video"; src: string };

const styles = `
@keyframes rd-reveal {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const IMAGE_RE = /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/;
const VIDEO_RE = /^\[video\]\((https?:\/\/[^)\s]+)\)$/;

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length) blocks.push({ kind: "text", lines: current });
    current = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const img = line.match(IMAGE_RE);
    if (img) {
      flush();
      blocks.push({ kind: "image", alt: img[1], src: img[2] });
      continue;
    }
    const vid = line.match(VIDEO_RE);
    if (vid) {
      flush();
      blocks.push({ kind: "video", src: vid[1] });
      continue;
    }
    current.push(line);
  }
  flush();
  return blocks;
}

function embedUrl(src: string): string | null {
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = src.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export default function RichDescription({ text }: { text: string }) {
  const blocks = parse(text);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:border-amber-400/30 sm:p-8"
      style={{ animation: "rd-reveal 500ms ease-out backwards" }}
    >
      <style>{styles}</style>

      <div className="space-y-8">
        {blocks.map((block, i) => {
          if (block.kind === "image") {
            return (
              <img
                key={i}
                src={block.src}
                alt={block.alt}
                className="w-full rounded-xl border border-white/10"
              />
            );
          }

          if (block.kind === "video") {
            const embed = embedUrl(block.src);
            if (embed) {
              return (
                <div key={i} className="aspect-video overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    src={embed}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title="Product video"
                  />
                </div>
              );
            }
            return (
              <video
                key={i}
                src={block.src}
                controls
                className="w-full rounded-xl border border-white/10"
              />
            );
          }

          const [title, ...rest] = block.lines;
          return (
            <div key={i} className="space-y-3">
              <h3 className="text-xl font-semibold leading-snug text-white">{title}</h3>
              {rest.length > 0 && (
                <div className="space-y-2">
                  {rest.map((line, j) =>
                    line.length <= 70 ? (
                      <div key={j} className="flex items-start gap-2 text-sm text-white/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        <span>{line}</span>
                      </div>
                    ) : (
                      <p key={j} className="text-sm leading-relaxed text-white/65">
                        {line}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}