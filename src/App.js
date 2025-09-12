import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllergyForm from './components/AllergyForm';
import OptionsPage from './components/OptionsPage';

function App() {
  return (
    <Router>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      }}>
        <Routes>
          <Route path="/" element={<AllergyForm />} />
          <Route path="/options" element={<OptionsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
