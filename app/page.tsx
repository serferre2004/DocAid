import React from 'react';
import Header from './components/Header';
import RecordPanel from './components/RecordPanel';
import FormPanel from './components/FormPanel';
import styles from './App.module.css';

function App() {
  return (
    <div>
    <Header />
      <div className={styles.container}>
        <main className={styles.mainContainer}>
          <RecordPanel />
        </main>
        <aside className={styles.formContainer}>
        <FormPanel/>
        </aside>
      </div>
    </div>
  );
}

export default App;