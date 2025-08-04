import { Link, Routes, Route } from 'react-router-dom';
import History from './pages/History';
import TodayReview from './pages/TodayReview';
import Words from './pages/Words';

function App() {
  return (
    <div>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '20px' }}>
          <li>
            <Link to="/">Today Reviewwwwwwwwwwww</Link>
          </li>
          <li>
            <Link to="/words">Words</Link>
          </li>
          <li>
            <Link to="/history">History</Link>
          </li>
        </ul>
      </nav>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<TodayReview />} />
          <Route path="/words" element={<Words />} />
          <Route path="/history" element={<History />} />
          <Route path="/today-review" element={<TodayReview />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
