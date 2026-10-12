import { Component, type ReactNode } from 'react';
import { Result } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result status="error" title="Something went wrong" subTitle="Please refresh the page." />
      );
    }
    return this.props.children;
  }
}
