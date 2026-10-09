"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main id="main" className="container page">
      <div className="empty-state" role="alert">
        <h1>We couldn&apos;t load this page</h1>
        <p>This is on our side. Try again in a moment.</p>
        <button className="btn btn-dark" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
