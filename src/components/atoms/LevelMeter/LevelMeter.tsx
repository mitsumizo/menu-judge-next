type Props = { level: number; icon: string; label: string };

export function LevelMeter({ level, icon, label }: Props) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${level}/5`}
      className="inline-flex gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          data-active={i <= level}
          className={i <= level ? "" : "opacity-20 grayscale"}
        >
          {icon}
        </span>
      ))}
    </span>
  );
}
