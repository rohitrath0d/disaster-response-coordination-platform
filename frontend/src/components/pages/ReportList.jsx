import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const baseUrl = import.meta.env.VITE_API_URL;

const ReportList = ({ disasterId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      // const { data } = await axios.get(`${baseUrl}/api/reports/${disasterId}`);
      const { data } = await axios.get(`${baseUrl}/api/disasters/reports/${disasterId}`);
      setReports(data.data || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (id) => {
  const handleDelete = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const { data } = await axios.delete(`${baseUrl}/api/disasters/reports/${reportId}`);
      if (data.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [disasterId]);

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold mb-2">📋 All Reports</h2>

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">No reports available for this disaster.</p>
      ) : (
        reports.map((report, i) => (
          <Card key={i} className="bg-white shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-700">User: {report.user_id}</span>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(report.id)}>
                  Delete
                </Button>
              </div>
              <div className="flex items-center justify-between">

                <p className="text-sm mb-2">{report.content}</p>

                {report.priority && (
                  <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded animate-pulse">
                    🚨 Priority
                  </span>
                )}
              </div>

            </CardHeader>
            <CardContent>
              {report.image_url && (
                <img src={report.image_url} alt="report" className="rounded max-w-xs" />
              )}

            </CardContent>
          </Card>
        ))
      )}



    </div>
  );
};

export default ReportList;
