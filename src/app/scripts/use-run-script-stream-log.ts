import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Buffers high-frequency stdout/stderr chunks and applies them once per frame so the
 * browser keeps draining the SSE stream quickly. Without this, each setState slows
 * the read loop and can backpressure the server child process (logs feel and run "slow").
 */
export function useRunScriptStreamLog() {
  const [log, setLog] = useState("");
  const pendingRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const chunk = pendingRef.current;
    pendingRef.current = "";
    if (chunk) setLog((p) => p + chunk);
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(flush);
    }
  }, [flush]);

  const appendStream = useCallback(
    (chunk: string) => {
      pendingRef.current += chunk;
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const appendImmediate = useCallback((chunk: string) => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = "";
    setLog((prev) => prev + pending + chunk);
  }, []);

  const flushPending = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = "";
    if (pending) setLog((prev) => prev + pending);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { log, setLog, appendStream, appendImmediate, flushPending };
}
