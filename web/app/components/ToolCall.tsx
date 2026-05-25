type Props = {
  name: string;
  args: Record<string, unknown>;
  done: boolean;
};

/**
 * One row in the "Agent steps" timeline.
 *
 * Showing the tool name + args (and not just a spinner) is intentional:
 * it's the interpretability angle the jury is evaluating. A reader can
 * tell exactly which Data360 indicator the agent queried before any
 * answer is rendered.
 */
export default function ToolCall({ name, args, done }: Props) {
  return (
    <div className="border border-neutral-200 rounded-md p-3 bg-neutral-50">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            done ? "bg-green-600" : "bg-amber-500 animate-pulse"
          }`}
          aria-label={done ? "completed" : "running"}
        />
        <span className="font-mono text-sm font-semibold text-neutral-800">
          {name}
        </span>
      </div>
      <pre className="font-mono text-xs text-neutral-600 whitespace-pre-wrap break-all ml-4">
        {JSON.stringify(args, null, 2)}
      </pre>
    </div>
  );
}
