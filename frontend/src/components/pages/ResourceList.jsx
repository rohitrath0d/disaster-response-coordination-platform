import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Pencil, Plus, Trash } from "lucide-react";
import ResourceForm from "./ResourceForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import toast from "react-hot-toast";

const baseUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;

const ResourceList = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [disasterId, setDisasterId] = useState("");


  useEffect(() => {
    // Get disasterId from localStorage
    const disasterId = localStorage.getItem("disasterId");

    if (!disasterId) {
      // Redirect back if no disasterId found
      navigate("/sidebar/dashboard");
      return;
    }

    setDisasterId(disasterId);
    fetchResources(disasterId);
  }, [navigate]);



  const fetchResources = async (disasterId) => {
    // if (!disasterId) {
    //   console.warn("No disasterId provided!");
    //   navigate("/sidebar/dashboard");       // Redirect if no disasterId
    //   return;
    // }

    try {
      setLoading(true);
      const { data } = await axios.get(
        `${baseUrl}/api/disasters/${disasterId}/resources/all`,
        {
          headers:
            { Authorization: `Bearer ${token}` },
            // { Authorization: `Bearer ${localStorage.getItem("token")}` }

        }
      );
      setResources(data.data || []);
    } catch (err) {
      console.error("Error fetching resource list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    const confirm = window.confirm("Are you sure you want to delete this resource?");
    if (!confirm) return;

    try {
      const { data } = await axios.delete(
        `${baseUrl}/api/disasters/${resourceId}/delete`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      } else {
        // alert("Delete failed.");
        toast.error("Delete failed.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      // alert("Error deleting resource.");
      toast.error("Error deleting resource.");
    }
  };

  useEffect(() => {
    fetchResources();
  }, [disasterId]);

  if (loading) return <div className="flex justify-center py-8">Loading resources...</div>;

  return (
    <div className="mt-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">🧭 Resources</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <p>No resources found for this disaster.</p>
      ) : (
        <div className="space-y-4">
          {resources.map((res) => (
            <Card key={res.id}>
              <CardHeader className="flex justify-between">
                <span className="font-semibold">{res.name}</span>
                <span className="text-sm text-gray-600">{res.type}</span>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">📍 {res.location_name || "Unnamed"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Coordinates: ({res.location?.coordinates?.[1]}, {res.location?.coordinates?.[0]})
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditTarget(res);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(res.id)}
                  >
                    <Trash className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "✏️ Edit Resource" : "➕ New Resource"}
            </DialogTitle>
          </DialogHeader>
          <ResourceForm
            initialData={editTarget}
            onDone={() => {
              setModalOpen(false);
              setEditTarget(null);
              fetchResources();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceList;