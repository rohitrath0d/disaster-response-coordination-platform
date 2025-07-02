import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../ui/navigation-menu";
import {
  Map,
  Zap,
  ShieldCheck,
  SatelliteDish,
  Users,
  SearchCheck,
  CheckCircle,
} from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Navbar */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/home" className="text-xl font-bold text-blue-700">
            Disaster Response
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/sidebar/dashboard" className="px-4 py-2 hover:text-blue-600">
                    Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/sidebar/reports" className="px-4 py-2 hover:text-blue-600">
                    Report Disaster
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/login" className="px-4 py-2 font-semibold text-indigo-600 hover:text-indigo-800">
                    Login
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      {/* Hero */}
      <header className="text-center py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
          🌍 Empowering Disaster Coordination
        </h1>
        <p className="text-lg max-w-xl mx-auto text-gray-600">
          AI-assisted verification, geospatial mapping, and real-time broadcasts — all on a single platform to reduce disaster impact and enhance response.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/sidebar/reports" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-lg shadow">
            🚨 Report a Disaster
          </Link>
          <Link to="/sidebar/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-lg shadow">
            🧭 Open Dashboard
          </Link>
        </div>
      </header>

      {/* Feature Highlights */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">⚙️ Core Capabilities</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <FeatureCard icon={<Map className="w-6 h-6 text-blue-600" />} title="Geospatial Detection" desc="Map disaster zones, shelters, and resources using precise coordinates via Supabase & mapping APIs." />
          <FeatureCard icon={<SearchCheck className="w-6 h-6 text-green-600" />} title="AI Verification" desc="Validate images using Google Gemini to eliminate misinformation and fake reports." />
          <FeatureCard icon={<Zap className="w-6 h-6 text-yellow-600" />} title="Live Socket Broadcasts" desc="Admin-triggered real-time broadcast ensures verified alerts reach everyone instantly." />
          <FeatureCard icon={<SatelliteDish className="w-6 h-6 text-indigo-600" />} title="Social Signal Scanning" desc="Capture alerts from mock Twitter/Bluesky to amplify user-generated SOS signals." />
          <FeatureCard icon={<ShieldCheck className="w-6 h-6 text-red-600" />} title="Role-Based Security" desc="Access dashboards and tools based on roles — admin, contributor, user." />
          <FeatureCard icon={<Users className="w-6 h-6 text-purple-600" />} title="Collaborative Reporting" desc="Empower citizens to report events with image proof and location hints." />
        </div>
      </section>

      {/* Interactive Workflow Timeline */}
      <section className="bg-blue-50 py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">🚀 How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {timelineSteps.map((step, index) => (
            <div key={index} className="bg-white hover:scale-105 transition-all duration-300 ease-in-out rounded-xl shadow p-6 text-center">
              <div className="text-blue-600 mb-3">
                <CheckCircle className="mx-auto h-10 w-10" />
              </div>
              <h4 className="font-semibold mb-2">{step.title}</h4>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-12 bg-white border-t">
        <p className="text-gray-600 mb-2 text-sm">Built with ☁️ Supabase, 🧠 Gemini, and ⚛️ React</p>
        <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} Disaster Response Platform by Rohit.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-5 border rounded-lg shadow hover:shadow-md transition-all">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-lg font-semibold ml-3">{title}</h3>
    </div>
    <p className="text-gray-600 text-sm">{desc}</p>
  </div>
);

const timelineSteps = [
  {
    title: "1. Report Disaster",
    description: "Users or field agents submit disaster reports with optional image proof."
  },
  {
    title: "2. AI Verifies Image",
    description: "Gemini API checks image authenticity to prevent misinformation."
  },
  {
    title: "3. Geo-Coordinate Mapping",
    description: "Location names are converted into coordinates for visualization."
  },
  {
    title: "4. Verified Broadcast",
    description: "Admins broadcast verified disasters to all users in real-time."
  }
];

export default HomePage;
