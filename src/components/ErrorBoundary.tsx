import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
  min-height: 200px;
  text-align: center;
  color: #444;
  font-size: 14px;
`;

const Title = styled.strong`
  font-size: 16px;
  color: #222;
`;

const Detail = styled.pre`
  max-width: 100%;
  overflow-x: auto;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 11px;
  color: #666;
  text-align: left;
  white-space: pre-wrap;
`;

const RetryButton = styled.button`
  background: #667eea;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: #5a6fd6;
  }
`;

interface Props {
  children: React.ReactNode;
  /** Label shown in the fallback, e.g. "info panel" */
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors so one bad component cannot blank the whole page.
 * Wrap the app and any panel that renders third-party API data.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Wrapper role="alert">
        <AlertTriangle size={28} color="#e0a800" />
        <Title>Something went wrong{this.props.label ? ` in the ${this.props.label}` : ''}</Title>
        <div>The rest of the app is still usable.</div>
        <Detail>{error.message}</Detail>
        <RetryButton onClick={this.handleReset}>Try again</RetryButton>
      </Wrapper>
    );
  }
}

export default ErrorBoundary;
