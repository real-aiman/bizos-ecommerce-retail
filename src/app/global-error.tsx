"use client";

import "./globals.css";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="container page">
          <div className="empty-state" role="alert">
            <h1>Something went wrong</h1>
            <p>Please reload the page.</p>
            <button className="btn btn-dark" type="button" onClick={() => reset()}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
