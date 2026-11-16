import Bi from "@/components/site/Bi";

type Props = {
  format: string;
  sizeLabel: string;
  publishedAt: string;
  updatedAt: string;
  downloads: number;
};

export default function ProductMeta({
  format,
  sizeLabel,
  publishedAt,
  updatedAt,
  downloads,
}: Props) {
  const items = [
    { label: <Bi en="Format" sv="Format" />, value: format },
    { label: <Bi en="File size" sv="Filstorlek" />, value: sizeLabel },
    { label: <Bi en="Published" sv="Publicerad" />, value: publishedAt.slice(0, 10) },
    { label: <Bi en="Last updated" sv="Senast uppdaterad" />, value: updatedAt.slice(0, 10) },
    { label: <Bi en="Downloads" sv="Nedladdningar" />, value: downloads.toLocaleString("en-US") },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-[#11141c] p-4 sm:grid-cols-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{item.value}</p>
        </div>
      ))}
    </div>
  );
}