import React from 'react';
import Header from './components/Header';
import RecordPanel from './components/RecordPanel';
import FormPanel from './components/FormPanel';

function App() {
  return (
    <div>
    <Header />
    <div className="flex min-h-screen bg-gradient-to-r from-purple-100 to-purple-200">
      <main className="flex gap-10 p-10">
        <RecordPanel />
      </main>
      <FormPanel/>
    </div>
    </div>
  );
}

export default App;