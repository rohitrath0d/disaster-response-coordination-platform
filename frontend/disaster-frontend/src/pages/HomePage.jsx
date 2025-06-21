import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <header className="text-center py-20 bg-gradient-to-br from-blue-100 to-indigo-100">
        <h1 className="text-5xl font-bold mb-4">🌍 Disaster Response Platform</h1>
        <p className="text-xl max-w-xl mx-auto text-gray-600">
          Real-time disaster tracking, reporting, and coordination. Empower communities with speed, data, and action.
        </p>
        <div className="mt-8">
          <Link
            to="/report"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-lg"
          >
            🚨 Report a Disaster
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">⚡ Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">📡 Live Updates</h3>
            <p className="text-gray-600">
              Get instant updates as disasters are reported and verified by responders.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">🗺️ Map View</h3>
            <p className="text-gray-600">
              Visualize real-time disaster locations across regions using geospatial data.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">🔍 Tag & Filter</h3>
            <p className="text-gray-600">
              Easily sort and filter disasters by type, severity, and location for quick action.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">🔐 Role-based Access</h3>
            <p className="text-gray-600">
              Admins, responders, and users all have their own secure dashboard experiences.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">🧠 Image Verification</h3>
            <p className="text-gray-600">
              AI-assisted disaster verification (via Gemini or other models) ensures authenticity.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">📢 Broadcast & Response</h3>
            <p className="text-gray-600">
              Mark and broadcast critical disasters to responders and local authorities.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Be Prepared. Stay Informed.</h2>
        <p className="mb-6 text-gray-600">
          Together, we can reduce disaster impact. Start contributing or viewing data now.
        </p>
        <Link
          to="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded text-lg"
        >
          View Dashboard
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Disaster Response Platform. Built with ♥ by Rohit.
      </footer>
    </div>
  );
};

export default HomePage;
