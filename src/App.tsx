import { Routes, Route, Navigate } from 'react-router-dom';
import PhotoGrid from './components/PhotoGrid';
import PhotoDetail from './components/PhotoDetail';

// Main application component handling routes
function App() {
  return (
    <Routes>
      {/* Redirect root to /photos */}
      <Route path="/" element={<Navigate to="/photos" replace />} />
      {/* Gallery grid view */}
      <Route path="/photos" element={<PhotoGrid />} />
      {/* Photo detail view */}
      <Route path="/photos/:id" element={<PhotoDetail />} />
    </Routes>
  );
}

export default App;
