import { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import axios from "axios";
import toast from "react-hot-toast";

const baseUrl = import.meta.env.VITE_API_URL;

const ReportForm = ({ disasterId }) => {
  const [form, setForm] = useState({
    content: "",
    image_url: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Get token from localStorage
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!token || !user?.id) {
      // return alert("❌ Please login to submit reports");
      return toast.error("❌ Please login to submit reports");
    }

    if (!form.content.trim()) {
      // return alert("❌ Please provide report content");
      return toast.error("❌ Please provide report content");
    }

    try {
      setLoading(true);
      
      // 2. Include Authorization header
      const res = await axios.post(`${baseUrl}/api/disasters/${disasterId}/reports`, 
        {
          ...form,
          user_id: user.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // alert("✅ Report submitted successfully!");
      toast.success("✅ Report submitted successfully!");
      setForm({ content: "", image_url: "" });
      return res.data;
    } catch (err) {
      console.error("Report submission error:", err);
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      "Failed to submit report";
      // alert(`❌ ${errorMsg}`);
      toast.error(`❌ ${errorMsg}`);
      
      // If token is invalid, clear auth data
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto">
      <h2 className="text-xl text-center font-bold mb-2">📢 Submit a Report</h2>

      <div>
        <label className="block p-2 text-sm font-medium mb-1">Description *</label>
        <Textarea
          rows={4}
          placeholder="Describe the situation..."
          value={form.content}
          onChange={(e) => handleChange("content", e.target.value)}
          required
          className="min-h-[120px]"
        />
      </div>

      <div>
        <label className="block p-2 text-sm font-medium mb-1">Image URL (optional)</label>
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={form.image_url}
          onChange={(e) => handleChange("image_url", e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !form.content.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : "Submit Report"}
      </Button>
    </form>
  );
};

export default ReportForm;