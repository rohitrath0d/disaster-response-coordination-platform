import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

const ReportPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  const [response, setResponse] = useState(null);

  // const onSubmit = async (data) => {
  //   try {
  //     const res = await axios.post("http://localhost:5000/api/disasters", {
  //       ...data,
  //       owner_id: "netrunnerX", // hardcoded for now
  //     });

  //     setResponse({ success: true, message: res.data.message });
  //     reset();
  //   } catch (err) {
  //     setResponse({
  //       success: false,
  //       message: err.response?.data?.message || "Submission failed",
  //     });
  //   }
  // };
  const baseUrl = import.meta.env.VITE_API_URL;
  const token = import.meta.env.VITE_ADMIN_TOKEN

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        owner_id: "netrunnerX",
        tags: data.tags
          ? data.tags.split(',').map(tag => tag.trim().toLowerCase())
          : [],
      };

      const res = await axios.post(
        // "http://localhost:5000/api/disasters",
        `${baseUrl}/api/disasters`,
        formattedData,
        {
          headers: {
            // Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2", // replace with your real token
            "Authorization": `Bearer ${token}`, // replace with your real token
          }
        }
      );

      setResponse({ success: true, message: res.data.message });
      reset();
    } catch (err) {
      console.error("❌ Submit error:", err);
      setResponse({
        success: false,
        message: err.response?.data?.message || "Submission failed",
      });
    }
  };


  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📝 Report a Disaster</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 bg-white p-4 rounded shadow"
      >
        <input
          type="text"
          placeholder="Disaster Title"
          {...register("title", { required: true })}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Description (include location info if possible)"
          {...register("description", { required: true })}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Location Name (e.g. Mumbai, India)"
          {...register("location_name")}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          {...register("tags")}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Disaster"}
        </button>
      </form>

      {response && (
        <div
          className={`mt- 4 p- 3 rounded ${
        response.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
        >
          {response.message}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
