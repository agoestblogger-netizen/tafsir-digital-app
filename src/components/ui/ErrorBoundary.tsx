'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="p-6 text-center rounded-2xl border"
          style={{
            background: 'rgba(10,21,32,0.85)',
            borderColor: 'rgba(201,163,90,0.15)',
          }}
        >
          <p className="font-cinzel text-[var(--gold)] mb-2 text-lg font-bold">
            Terjadi Kesalahan
          </p>
          <p className="font-cairo text-sm text-[var(--text2)] mb-4">
            Terjadi kesalahan saat memuat konten ini. Coba muat ulang halaman.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="font-cairo text-xs mt-1 px-4 py-2 rounded-lg border border-[var(--gold-border)] text-[var(--gold)] hover:bg-[var(--dark2)] transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
