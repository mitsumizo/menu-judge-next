import { Tag } from "@/components/atoms/Tag/Tag";

type Props = { label: string; items: string[]; emptyText: string };

export function TagList({ label, items, emptyText }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-text-secondary text-sm">{label}</p>
      {items.length === 0 ? (
        <p className="text-text-secondary/70 text-xs">{emptyText}</p>
      ) : (
        <ul aria-label={label} className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
