import { LevelMeter } from "@/components/atoms/LevelMeter/LevelMeter";

type Props = { label: string; level: number; icon: string };

export function LevelRow({ label, level, icon }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-text-secondary text-sm">{label}</span>
      <LevelMeter level={level} icon={icon} label={label} />
    </div>
  );
}
