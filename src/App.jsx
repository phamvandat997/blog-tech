import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { HubPage } from './pages/HubPage';
import { ReaderPage } from './pages/ReaderPage';
import { QuizPage } from './pages/QuizPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Toast } from './components/common/Toast';
import { ScrollToTop } from './components/common/ScrollToTop';

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<HomePage />} />

        {/* Hub */}
        <Route path="/hub" element={<HubPage />} />
        <Route path="/hub.html" element={<HubPage />} />

        {/* Reader (handles both query params ?s=..&d=.. and clean routes) */}
        <Route path="/reader" element={<ReaderPage />} />
        <Route path="/reader.html" element={<ReaderPage />} />
        <Route path="/reader/:section/*" element={<ReaderPage />} />

        {/* Quiz */}
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz.html" element={<QuizPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin.html" element={<AdminPage />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toast />
    </>
  );
}

export default App;
