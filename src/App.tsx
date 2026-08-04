import React from 'react';
import InteractiveMap from './components/InteractiveMap';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App" style={{ height: '100vh', margin: 0, padding: 0 }}>
      {/* Last line of defence — without it any render throw blanks the page */}
      <ErrorBoundary>
        <InteractiveMap />
      </ErrorBoundary>
    </div>
  );
}

export default App;
