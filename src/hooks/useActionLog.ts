import { useCallback, useState } from "react";
import { LogKind, LogLine } from "../components/emporium/types";

export const useActionLog = () => {
  const [lines, setLines] = useState<LogLine[]>([]);

  const append = useCallback((text: string, kind: LogKind = "info") => {
    setLines((prev) => [
      ...prev,
      { at: new Date().toLocaleTimeString(), text, kind },
    ]);
  }, []);

  const clear = useCallback(() => setLines([]), []);

  return { lines, append, clear };
};
