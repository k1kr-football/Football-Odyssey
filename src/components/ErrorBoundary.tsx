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
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white bg-red-900 w-full h-full absolute inset-0 z-50">
          <div className="w-24 h-24 rounded-full bg-black/50 flex items-center justify-center mb-4 text-red-500 text-5xl">
            ⚠️
          </div>
          <h2 className="text-4xl font-black uppercase tracking-wider mb-2 text-white">FATAL CRASH</h2>
          <p className="text-white/80 text-lg mb-6 max-w-2xl font-bold">
            THE GAME CRASHED. PLEASE TELL THE AI THIS EXACT MESSAGE:
            <br/><br/>
            <span className="font-mono text-xl bg-black p-4 rounded block whitespace-pre-wrap text-[#00FF88]">{this.state.error?.message}</span>
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              if (this.props.onReset) {
                this.props.onReset();
              }
            }}
            className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-lg rounded shadow-xl hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
