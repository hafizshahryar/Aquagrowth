import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleClearData = () => {
    try {
      localStorage.removeItem('aqua_batches');
      localStorage.removeItem('aqua_records');
      window.location.reload();
    } catch (e) {
      alert("Failed to clear data. Please clear browser cache manually.");
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-slate-600 mb-4">The application encountered an unexpected error.</p>
            <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-700 mb-6 overflow-auto max-h-40">
              {this.state.error?.message}
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Reload Application
              </button>
              
              <button
                onClick={this.handleClearData}
                className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                Clear Data & Reset
              </button>
              <p className="text-xs text-center text-slate-400">
                Warning: "Clear Data" will remove all saved fish batches.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}