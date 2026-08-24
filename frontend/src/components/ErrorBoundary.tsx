import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
            <h1 className="text-lg font-bold mb-2">Something crashed while rendering this page</h1>
            <p className="text-sm font-mono whitespace-pre-wrap break-words bg-black/30 p-3 rounded-xl mt-3">
              {this.state.error.toString()}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
              className="mt-4 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
