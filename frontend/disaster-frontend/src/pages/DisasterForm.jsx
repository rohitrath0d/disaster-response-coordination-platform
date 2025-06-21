/* eslint-disable no-unused-vars */
import { useForm } from "react-hook-form";
import axios from "axios";
import { useEffect } from "react";
import { io } from "socket.io-client";


const baseUrl = import.meta.env.VITE_API_URL;

const DisasterForm = ({ onSuccess, defaultValues = {}, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const onSubmit = async (data) => {
    try {
      const url = isEdit
        // ? `http://localhost:5000/api/disasters/${defaultValues.id}`
        ? `${baseUrl}/${defaultValues.id}`
        // : `http://localhost:5000/api/disasters`;
        : `${baseUrl}/api/disasters`;

      const method = isEdit ? "put" : "post";

      const res = await axios[method](url, data, {
        headers: {
          Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2",
        },
      });

      onSuccess(); // trigger refresh
      reset();
    } catch (err) {
      console.error("❌ Form submit error:", err);
      alert("Failed to submit disaster");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      <input
        {...register("title", { required: true })}
        placeholder="Disaster title"
        className="border px-2 py-1 rounded"
      />
      <input
        {...register("description", { required: true })}
        placeholder="Description"
        className="border px-2 py-1 rounded"
      />
      <input
        {...register("location_name", { required: true })}
        placeholder="Location name"
        className="border px-2 py-1 rounded"
      />
      <input
        {...register("location", { required: true })}
        placeholder="Location hex (mock for now)"
        className="border px-2 py-1 rounded"
      />
      <input
        {...register("tags")}
        placeholder="Tags (comma separated)"
        className="border px-2 py-1 rounded"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Update" : "Create"} Disaster
      </button>
    </form>
  );
};

export default DisasterForm;
