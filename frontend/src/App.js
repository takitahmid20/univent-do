import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormBuilder from './components/FormBuilder/FormBuilder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/form-builder" element={<FormBuilder />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
