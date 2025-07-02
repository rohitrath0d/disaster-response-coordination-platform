/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,

} from "../ui/card";
import { Button } from "../ui/button";
import { socket } from "../../Socket";
// import { Info, AlertCircle, ExternalLink, ChevronDown, ChevronUp, Badge } from "lucide-react";
import { 
  Info, AlertCircle, ExternalLink, ChevronDown, ChevronUp,
  CloudRain, CloudLightning, CloudSnow, Sun, Cloud, Wind,
  MapPin, Calendar, AlertTriangle, Droplets, Thermometer, Badge
} from "lucide-react";
import { Input } from "../ui/input";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const baseUrl = import.meta.env.VITE_API_URL;

// Weather icon mapping
const WEATHER_ICONS = {
  thunderstorm: <CloudLightning className="w-5 h-5 text-purple-500" />,
  rain: <CloudRain className="w-5 h-5 text-blue-500" />,
  snow: <CloudSnow className="w-5 h-5 text-cyan-300" />,
  clear: <Sun className="w-5 h-5 text-yellow-500" />,
  clouds: <Cloud className="w-5 h-5 text-gray-400" />,
  wind: <Wind className="w-5 h-5 text-gray-500" />,
  default: <AlertTriangle className="w-5 h-5 text-orange-500" />
};

export default function OfficialUpdatesPanel() {
  const [updates, setUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [disasterId, setDisasterId] = useState("");
  const [status, setStatus] = useState({
    type: null, // 'info' | 'error' | 'empty' | 'warning'
    message: ""
  });
  const [filters, setFilters] = useState({
    source: "all", // 'all' | 'fema' | 'ndma'
    severity: "all", // 'all' | 'high' | 'medium' | 'low'
    visibleCount: 15 // Initial number of items to show
  });

  const sampleDisasters = [
    { id: "fccfbc5e-fb4c-47f5-b303-451937d1c485", name: "Landslide Blocks Roads in Shimla" },
    { id: "adceb23c-efbc-4b4f-909c-8b7a08c5ded2", name: "Test Flood in Kerala"}
  ];

  // Get appropriate weather icon
  const getWeatherIcon = (alertType) => {
    const type = alertType?.toLowerCase() || '';
    if (type.includes('thunder')) return WEATHER_ICONS.thunderstorm;
    if (type.includes('rain')) return WEATHER_ICONS.rain;
    if (type.includes('snow')) return WEATHER_ICONS.snow;
    if (type.includes('clear')) return WEATHER_ICONS.clear;
    if (type.includes('cloud')) return WEATHER_ICONS.clouds;
    if (type.includes('wind')) return WEATHER_ICONS.wind;
    return WEATHER_ICONS.default;
  };


  // Enhanced Alert Card Component
  const AlertCard = ({ update }) => {
    const [expanded, setExpanded] = useState(false);
    const weatherIcon = getWeatherIcon(update.type);
    
    return (
      <Card 
        className={`hover:shadow-md transition-shadow ${expanded ? 'bg-gray-50' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {weatherIcon}
              <h3 className="font-medium text-lg">
                {update.title}
                {update.severity && <SeverityBadge severity={update.severity} />}
              </h3>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{update.districts?.join(', ') || 'Multiple areas affected'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(update.timestamp).toLocaleString()}</span>
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Thermometer className="w-4 h-4" />
                  <span>Severity: {update.severity || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  <span>Type: {update.type || 'Weather Alert'}</span>
                </div>
              </div>

              {update.description && (
                <p className="text-sm text-muted-foreground">
                  {update.description}
                </p>
              )}

              {update.url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={(e) => e.stopPropagation()}
                  asChild
                >
                  <a href={update.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View official details
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Filter and sort updates whenever filters or updates change
  useEffect(() => {
    let result = [...updates];

    // Apply source filter
    if (filters.source !== 'all') {
      result = result.filter(update =>
        filters.source === 'fema'
          ? update.sourceSystem === 'FEMA'
          : update.sourceSystem === 'NDMA'
      );
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      result = result.filter(update =>
        update.severity?.toLowerCase() === filters.severity
      );
    }

    // Sort by importance (High first) then by timestamp (newest first)
    result.sort((a, b) => {
      const severityOrder = { High: 3, Medium: 2, Low: 1 };
      const aScore = severityOrder[a.severity] || 0;
      const bScore = severityOrder[b.severity] || 0;

      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    setFilteredUpdates(result.slice(0, filters.visibleCount));
  }, [updates, filters]);

  const fetchUpdates = async (id) => {
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const { data } = await axios.get(
        `${baseUrl}/api/officialupdate/${id}`
      );

      if (data.data?.length > 0) {
        setUpdates(data.data);
        setCached(data.meta?.source === 'cache');

        setStatus({
          type: "info",
          message: `Found ${data.data.length} updates (${data.meta?.source || 'live data'})`
        });
      } else {
        setUpdates([]);
        setStatus({
          type: "empty",
          message: `No official updates found for ${id}. Try another disaster ID.`
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setUpdates([]);

      const errorMessage = error.response?.data?.error ||
        error.message ||
        "Failed to fetch updates";

      setStatus({
        type: "error",
        message: errorMessage.includes("timeout")
          ? "Request timed out. The server might be busy. Please try again later."
          : errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setFilters(prev => ({
      ...prev,
      visibleCount: prev.visibleCount + 10
    }));
  };

  const SeverityBadge = ({ severity }) => {
    const variants = {
      High: "destructive",
      Medium: "warning",
      Low: "default"
    };

    return (
      <Badge variant={variants[severity] || "default"} className="ml-2">
        {severity || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="w-full mx-auto p-4 space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Official Disaster Updates
          </CardTitle>
          <CardDescription>
            Verified information from government and relief agencies
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter Disaster ID (e.g. TRY:- fccfbc5e-fb4c-47f5-b303-451937d1c485)"
              value={disasterId}
              onChange={(e) => setDisasterId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUpdates(disasterId)}
            />
            <Button
              onClick={() => fetchUpdates(disasterId)}
              disabled={!disasterId || loading}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Searching..." : "Get Updates"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {sampleDisasters.map((disaster) => (
              <Button
                key={disaster.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setDisasterId(disaster.id);
                  fetchUpdates(disaster.id);
                }}
              >
                {disaster.name}
              </Button>
            ))}
          </div>

          {/* Filter Controls */}
          {updates.length > 0 && (
            <div className="flex flex-wrap gap-3 items-center">
              <Select
                value={filters.source}
                onValueChange={(value) => setFilters({ ...filters, source: value })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent  className="bg-white z-50">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="fema">FEMA Only</SelectItem>
                  <SelectItem value="ndma">NDMA Only</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.severity}
                onValueChange={(value) => setFilters({ ...filters, severity: value })}
              >
                <SelectTrigger className="w-[135px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High Only</SelectItem>
                  <SelectItem value="medium">Medium Only</SelectItem>
                  <SelectItem value="low">Low Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Messages */}
          {status.type && (
            <Alert variant={status.type === "error" ? "destructive" : status.type === "warning" ? "warning" : "default"}>
              {status.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle className="capitalize">{status.type}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {/* {filteredUpdates.length > 0 ? (
            <div className="space-y-3">
              {filteredUpdates.map((update, index) => (
                <Card key={`${update.sourceSystem}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">
                        {update.title}
                        {update.severity && <SeverityBadge severity={update.severity} />}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {update.districts?.length > 0 && (
                      <p className="mt-1 text-sm">
                        <span className="font-medium">Areas:</span> {update.districts.join(', ')}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>Source: {update.source}</span>
                      {cached && <Badge variant="outline">Cached</Badge>}
                    </div>

                    {update.url && (
                      <a
                        href={update.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View official source
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))} */}

              {filteredUpdates.length > 0 ? (
            <div className="space-y-3">
              {filteredUpdates.map((update, index) => (
                <AlertCard key={`${update.sourceSystem}-${index}`} update={update} />
              ))}

              {filteredUpdates.length < updates.length && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={loadMore}
                >
                  Load More ({updates.length - filteredUpdates.length} remaining)
                </Button>
              )}
            </div>
          ) : (
            !loading && !status.type && (
              <div className="text-center py-8 text-muted-foreground">
                Enter a disaster ID to search for official updates. TRY: fccfbc5e-fb4c-47f5-b303-451937d1c485 to see the magic. 😉
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}