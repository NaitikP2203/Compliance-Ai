import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 w-full max-w-md mx-auto text-center">
          <div className="bg-red-50 p-4 rounded-full mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111] mb-2">Something went wrong</h2>
          <p className="text-[#666666] mb-8">
            An unexpected error occurred. Our engineering team has been notified.
            Please try refreshing the page.
          </p>
          <Button onClick={this.handleReset} className="w-full sm:w-auto" variant="default">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-[#f5f5f5] rounded-lg text-left overflow-auto w-full max-h-64">
              <pre className="text-xs text-red-600 font-mono">
                {this.state.error.stack || this.state.error.message}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
