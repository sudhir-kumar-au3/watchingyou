import { cn } from '@/utils/cn';

interface CodePanelProps {
  sourceCode: string;
  highlightedLines: number[];
}

export const CodePanel = ({ sourceCode, highlightedLines }: CodePanelProps) => {
  const lines = sourceCode.split('\n');
  const active = new Set(highlightedLines);

  return (
    <pre className="overflow-x-auto rounded-xl bg-black/30 p-4 font-mono text-[13px] leading-relaxed">
      <code>
        {lines.map((line, idx) => {
          const lineNumber = idx + 1;
          const isActive = active.has(lineNumber);
          return (
            <div
              key={lineNumber}
              className={cn(
                '-mx-4 flex gap-4 px-4 transition-colors',
                isActive && 'bg-cyan/15 shadow-[inset_2px_0_0_var(--color-cyan)]'
              )}
            >
              <span className="w-6 select-none text-right text-edge tabular-nums">
                {lineNumber}
              </span>
              <span
                className={cn(
                  'whitespace-pre',
                  isActive ? 'text-cyan' : 'text-mist/85'
                )}
              >
                {line || ' '}
              </span>
            </div>
          );
        })}
      </code>
    </pre>
  );
};
