import { Link } from 'react-router-dom';
import ReportPage from './components/pages/ReportPage';



function App() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🌐 Disaster Management</h1>
      <nav className="flex gap-4 justify-center">
        {/* <Link className="text-blue-600 hover:underline" to="/report">Report</Link> */}
        {/* <Link className="text-blue-600 hover:underline" to="/dashboard">Dashboard</Link> */}
        {/* <Link className="text-blue-600 hover:underline" to="/map">Map</Link> */}
      </nav>
    </div>
  );
}

// export default App;

// function App() {

//   return (
//     <>
//     <h1 className="text-2xl font-bold text-center mt-10">Disaster Management Frontend</h1>;
//     </>
//   )
// }

export default App
