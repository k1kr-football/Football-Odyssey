import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white bg-[#0a0a0a]">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-4 text-red-500 text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold font-display uppercase tracking-wider mb-2">Something went wrong</h2>
          <p className="text-[#888] text-sm mb-6 max-w-md">
            An unexpected error occurred while rendering this screen.
            <br/><br/>
            <span className="font-mono text-xs text-red-400">{this.state.error?.message}</span>
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              if (this.props.onReset) {
                this.props.onReset();
              }
            }}
            className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs font-mono rounded hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
