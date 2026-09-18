import { LogLine } from "./types";

const colorByKind = {
  err: "text-hinkal-red-100",
  ok: "text-hinkal-green-200",
  info: "text-hinkal-white-300",
} as const;

export const LogPanel = ({ lines }: { lines: LogLine[] }) => {
  if (!lines.length) return null;

  return (
    <div className="bg-hinkal-blue-100 rounded-lg p-3 flex flex-col gap-y-1 max-h-60 overflow-y-auto">
      {lines.map((line, index) => (
        <div
          key={index}
          className={`text-[11px] font-mono break-all ${colorByKind[line.kind]}`}
        >
          <span className="opacity-50">{line.at}</span> {line.text}
        </div>
      ))}
    </div>
  );
};
