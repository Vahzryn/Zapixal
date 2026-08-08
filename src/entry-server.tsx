import React, { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

export async function renderApp(path: string): Promise<string> {
  const html = renderToString(
    <StrictMode>
      <ErrorBoundary>
        <App initialPath={path} />
      </ErrorBoundary>
    </StrictMode>
  );
  return html;
}
