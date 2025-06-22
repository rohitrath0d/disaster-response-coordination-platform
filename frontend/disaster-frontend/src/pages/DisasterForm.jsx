import axios from "axios";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
// import { io } from "socket.io-client";


const baseUrl = import.meta.env.VITE_API_URL;
const token = import.meta.env.VITE_ADMIN_TOKEN;


const DisasterForm = ({ initialData, onClose }) => {

  const isEdit = !!initialData;

  // const {
  //   register,
  //   handleSubmit,
  //   reset,
  //   formState: { isSubmitting },
  // } = useForm({ defaultValues });

  // useEffect(() => {
  //   reset(defaultValues);
  // }, [defaultValues]);

  // const onSubmit = async (data) => {
  //   try {
  //     const url = isEdit
  //       // ? `http://localhost:5000/api/disasters/${defaultValues.id}`
  //       ? `${baseUrl}/${defaultValues.id}`
  //       // : `http://localhost:5000/api/disasters`;
  //       : `${baseUrl}/api/disasters`;

  //     const method = isEdit ? "put" : "post";

  //     const res = await axios[method](url, data, {
  //       headers: {
  //         Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2",
  //       },
  //     });

  //     onSuccess(); // trigger refresh
  //     reset();
  //   } catch (err) {
  //     console.error("❌ Form submit error:", err);
  //     alert("Failed to submit disaster");
  //   }
  // };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [location, setLocation] = useState(""); // hex format
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setLocationName(initialData.location_name || "");
      setLocation(initialData.location || "");
      setTags(initialData.tags?.join(", ") || "");
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      location_name: locationName,
      location,
      tags: tags.split(",").map((t) => t.trim()),
    };

    try {
      if (isEdit) {
        await axios.put(`${baseUrl}/api/disasters/${initialData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Disaster updated");
      } else {
        await axios.post(`${baseUrl}/api/disasters`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Disaster created");
      }
      onClose(); // Close modal after success
    } catch (err) {
      console.error("Form error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      // className="grid gap-3"
      className="relative bg-white p-6 rounded shadow max-w-xl w-full space-y-4"

    >

      {/* Close Icon */}
      <button
        onClick={onClose}
        type="button"
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
      >
        <X size={20} />
      </button>


      <h2 className="text-xl font-semibold mb-2">
        {isEdit ? "✏️ Edit Disaster" : "➕ Create Disaster"}
      </h2>


      <input
        // {...register("title", { required: true })}
        type="text"
        placeholder="Disaster title"
        className="border px-3 py-2 rounded w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        // {...register("description", { required: true })}
        type="text"
        placeholder="Description"
        className="border px-3 py-2 rounded w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        // {...register("location_name", { required: true })}
        type="text"
        className="border px-3 py-2 rounded w-full"
        placeholder="Location name"
        value={locationName}
        onChange={(e) => setLocationName(e.target.value)}
      />
      <input
        // {...register("location", { required: true })}
        type="text"
        placeholder="Location hex (mock for now)"
        className="border px-3 py-2 rounded w-full"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        // {...register("tags")}
        type="text"
        placeholder="Tags (comma separated)"
        className="border px-3 py-2 rounded w-full"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <button
        type="submit"
        // disabled={isSubmitting}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Update Disaster" : "Create Disaster"} Disaster
      </button>
    </form>
  );
};

export default DisasterForm;
