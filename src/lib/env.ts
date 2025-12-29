type RuntimeEnv = Record<string, string | undefined>;

function readRuntimeEnv(): RuntimeEnv | undefined {
  try {
    return typeof window !== 'undefined' ? window.__ENV__ : undefined;
  } catch {
    return undefined;
  }
}

export function getEnv(key: string): string | undefined {
  const runtimeValue = readRuntimeEnv()?.[key];
  if (runtimeValue) return runtimeValue;

  const buildValue = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key];
  return buildValue || undefined;
}
