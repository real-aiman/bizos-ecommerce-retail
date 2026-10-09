import * as Sentry from "@sentry/nextjs";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export function reportError(error: unknown, context?: Record<string, unknown>): string {
  const normalized = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(normalized, { extra: context });
  return normalized.message;
}

export function toActionError(error: unknown, context?: Record<string, unknown>): ActionResult<never> {
  reportError(error, context);
  return {
    ok: false,
    error: "Something went wrong. Please try again."
  };
}

export async function withServerErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    return toActionError(error, context);
  }
}
