import type { AlgorithmInfo } from '@/core/engine/types';

interface InfoPanelProps {
  info: AlgorithmInfo;
}

const ComplexityCell = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5 rounded-lg bg-white/5 px-3 py-2">
    <span className="text-[10px] uppercase tracking-wide text-haze">
      {label}
    </span>
    <span className="font-mono text-sm text-mist">{value}</span>
  </div>
);

const List = ({ title, items }: { title: string; items: string[] }) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-haze">
      {title}
    </h4>
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-mist/85">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export const InfoPanel = ({ info }: InfoPanelProps) => (
  <div className="flex flex-col gap-5">
    <p className="text-sm leading-relaxed text-mist/85">{info.explanation}</p>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <ComplexityCell label="Best" value={info.complexity.timeBest} />
      <ComplexityCell label="Average" value={info.complexity.timeAverage} />
      <ComplexityCell label="Worst" value={info.complexity.timeWorst} />
      <ComplexityCell label="Space" value={info.complexity.space} />
    </div>

    <div className="grid gap-5 sm:grid-cols-2">
      <List title="Use cases" items={info.useCases} />
      <List title="Real-world" items={info.realWorld} />
    </div>
  </div>
);
