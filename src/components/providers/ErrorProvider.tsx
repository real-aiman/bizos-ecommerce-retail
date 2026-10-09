"use client";

import * as Sentry from "@sentry/nextjs";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack }
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="container" style={{ paddingTop: 80 }}>
          <div className="empty-state" role="alert">
            <h1>Something went wrong</h1>
            <p>We could not complete that action. Please try again.</p>
            <button
              className="primary-button"
              style={{ maxWidth: 220, margin: "20px auto 0" }}
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export function ErrorProvider({ children }: Props) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
