import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled render error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight">Something Went Wrong</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            An unexpected error occurred while rendering this page. Try reloading — if the
            problem persists, contact your system administrator.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
