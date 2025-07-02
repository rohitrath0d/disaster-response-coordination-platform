/* eslint-disable no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { CheckCircleIcon, CheckIcon, MegaphoneIcon, X } from "lucide-react";
// import { io } from "socket.io-client";
import { Switch } from "../ui/switch";
import toast from "react-hot-toast";


const baseUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;


const DisasterForm = ({ initialData = null, onClose }) => {

  // const isEdit = !!initialData;

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

  const [formData, setFormData] = useState({

    id: initialData?.id, // Add id if editing existing disaster

    title: initialData?.title || "",
    description: initialData?.description || "",
    location_name: initialData?.location_name || "",
    location: initialData?.location || "",
    tags: initialData?.tags?.join(", ") || "",
    image_url: initialData?.image_url || "",
    // verification_status: initialData?.verification_status || "pending"
    verification_result: initialData?.verification_result || '',
    broadcasted: initialData?.broadcasted || false
  });


  // const [title, setTitle] = useState("");
  // const [description, setDescription] = useState("");
  // const [locationName, setLocationName] = useState("");
  // const [location, setLocation] = useState(""); // hex format
  // const [imageUrl, setImageUrl] = useState("");
  // const [tags, setTags] = useState("");


  const [verifying, setVerifying] = useState(false);
  // const [verificationStatus, setVerificationStatus] = useState("");

  // const [imageInputs, setImageInputs] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);


  // useEffect(() => {
  //   if (initialData) {
  //     setTitle(initialData.title || "");
  //     setDescription(initialData.description || "");
  //     setLocationName(initialData.location_name || "");
  //     setLocation(initialData.location || "");
  //     setTags(initialData.tags?.join(", ") || "");
  //     setImageUrl(initialData.image_url || "")
  //   }
  // }, [initialData]);


  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);


    // const payload = {
    //   title,
    //   description,
    //   location_name: locationName,
    //   location,
    //   tags: tags.split(",").map((t) => t.trim()),
    //   image_url: imageUrl,
    // };

    //   try {
    //     if (isEdit) {
    //       await axios.put(`${baseUrl}/api/disasters/${initialData.id}`, payload, {
    //         headers: { Authorization: `Bearer ${token}` },
    //       });
    //       alert("Disaster updated");
    //     } else {
    //       await axios.post(`${baseUrl}/api/disasters`, payload, {
    //         headers: { Authorization: `Bearer ${token}` },
    //       });
    //       alert("Disaster created");
    //     }
    //     onClose(); // Close modal after success
    //   } catch (err) {
    //     console.error("Form error:", err);
    //     alert("Something went wrong.");
    //   }
    // };

    try {

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id || user?.user_id || "netrunnerX"; // fallback (dev only)

      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()),  // --> already handled in tags structure in backend.
        // owner_id: "default_owner_id" // Add this if your backend requires it      // Make sure this matches your backend requirements
        owner_id: userId // ✅ Must match backend param


      };

      // const response = await axios.post(`${baseUrl}/api/disasters`, payload, {
      //   headers: { "Authorization": `Bearer ${token}` },
      // });

      // let response;

      // Determine if this is an edit or create operation
      const isEdit = initialData?.id || formData?.id;


      // if (formData || initialData) {
      // if (initialData) {
      if (isEdit) {
        // update existing disaster 
        // const response = await axios.put(`${baseUrl}/api/disasters/${initialData.id}`, payload, {
        // const response = await axios.put(`${baseUrl}/api/disasters/${initialData.id}`, payload, {

        // const disasterId = initialData?.id || formData?.id;

        // const response = await axios.put(`${baseUrl}/api/disasters/${initialData.id}`, payload, {
        const response = await axios.put(`${baseUrl}/api/disasters/${initialData.id}`, payload, {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          // 'Content-Type': 'application/json',
        });

        // const created = response.data.data; // this includes the id


        // // ✅ Save it
        // setFormData(prev => ({
        //   ...prev,
        //   id: created.id,
        //   verification_status: created.verification_status || null
        // }));

        if (response.data.success) {
          onClose(); // Close the form on success
        }

        // alert("Disaster updated.");
        toast.success('Disaster updated.', {
          position: 'top-right'
        });
      } else {
        // create new disaster
        // const response = await axios.post(`${baseUrl}/api/disasters`, payload, {
        // const response = await axios.  post(`${baseUrl}/api/disasters`,
        const response = await axios.post(`${baseUrl}/api/disasters`,
          payload,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              // 'Content-Type': 'application/json',
            },
          }
        );
        console.log(response);

        // alert("Disaster created.");
        toast.success('Disaster created.', {
          position: 'top-right'
        });

        const createdDisaster = response.data.data;

        // ✅ Save ID + verification status
        setFormData(prev => ({
          ...prev,
          id: createdDisaster.id,
          owner_id: userId,
          // owner_id: "default_owner_id",
          verification_status: createdDisaster.verification_status || "pending"
        }));

        // alert(initialData ? "Disaster updated" : "Disaster created");
        // return createdDisaster; // Return the created data for chaining;

        // if (response.data.success) {
        //   //   onClose(); // Close modal on success
        //   alert("Disaster created.");

        //   //   // // ✅ Clear the form if it was a create operation
        //   //   // setFormData({
        //   //   //   title: "",
        //   //   //   description: "",
        //   //   //   location_name: "",
        //   //   //   location: "",
        //   //   //   tags: "",
        //   //   //   image_url: "",
        //   //   // });

        //   //   // ✅ Save it
        //   //   setFormData(prev => ({
        //   //     ...prev,
        //   //     id: created.id,
        //   //     verification_status: created.verification_status || null
        //   //   }));

        // }

        // if (response.data.success) {
        //   onClose(); // Close the form on success
        // }

        if (createdDisaster?.id) {
          localStorage.setItem("disasterId", createdDisaster.id); // ✅ Save it for global use
        }

        // Only close modal if specified
        if (response.data.success || response.status === 200 || response.status === 201) {
          // Don't close automatically - let user verify first if needed
          // onClose(); 
        }


      }

      // onClose();


    } catch (err) {
      console.error("Form error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong"
      );
      // alert("Failed to create disaster.");
      toast.error("Failed to create disaster.", {
        position: 'top-right'
      })

    } finally {
      setIsSubmitting(false);
    }
  };


  // const handleImageVerify = async () => {
  //   // if (!formData.image_url) return alert("Please enter an image URL.");
  //   // if (!initialData?.id) return alert("Save the disaster first before verifying image.");

  //   // Validate image URL format first
  //   if (!formData.image_url) {
  //     setError("Please enter an image URL");
  //     return;
  //   }

  //   // Basic URL validation
  //   try {
  //     new URL(formData.image_url);
  //   } catch (e) {
  //     setError("Please enter a valid URL");
  //     return;
  //   }

  //   if (!initialData?.id) {
  //     setError("Please save the disaster first before verifying image");
  //     return;
  //   }

  //   try {
  //     setVerifying(true);
  //     setError(null);
  //     setVerificationStatus("") // Reset status before verification
  //     const res = await axios.post(
  //       `${baseUrl}/api/disasters/${initialData.id}/verify-image`,
  //       {
  //         image_url: formData.image_url,
  //         disaster_title: formData.title // Optional: send title for context
  //       },

  //       {
  //         headers: {
  //           "Authorization": `Bearer ${token}`,
  //           "Content-Type": "application/json"
  //         },
  //         timeout: 30000 // 30 second timeout
  //       }
  //     );
  //     // setVerificationStatus(res.data.verification_status);
  //     if (res.data.success) {
  //       setVerificationStatus(res.data.verification_status);

  //       // Optional: Update local form state if verification succeeded
  //       if (res.data.verification_status === "verified") {
  //         setFormData(prev => ({
  //           ...prev,
  //           verification_status: "verified"
  //         }));
  //       }
  //     } else {
  //       setError(res.data.message || "Verification failed");
  //       setVerificationStatus("error");
  //     }
  //   } catch (err) {
  //     console.error("Verification failed:", err);
  //     // setVerificationStatus("error");

  //     let errorMessage = "Verification failed";
  //     if (err.response) {
  //       errorMessage = err.response.data?.message || errorMessage;
  //     } else if (err.message.includes("timeout")) {
  //       errorMessage = "Verification timed out";
  //     }

  //     setError(errorMessage);
  //     setVerificationStatus("error");

  //   } finally {
  //     setVerifying(false);
  //   }
  // };


  // Handle image verification

  const handleImageVerify = async () => {

    console.log("Verify clicked:", formData);


    // if (!formData.image_url) return;
    // if (!formData.image_url || !initialData?.id) {
    // if (!formData.image_url) {

    // if (!formData.image_url || !formData.id) {
    //   // if (!formData.id) {
    //   setError("Please save the disaster with an image URL first");
    //   return;
    // }


    // Use either initialData.id (for edits) or formData.id (after creation)
    // const disasterId = initialData?.id || formData?.id;
    // if (!disasterId) {
    //   setError("Please save the disaster first before verifying");
    //   return;
    // }

    try {

      if (!formData.image_url) {
        setError("Please provide an image URL");
        return;
      }


      // // If no ID exists, submit the form first
      // if (!formData.id && !initialData?.id) {
      //   const createdDisaster = await handleSubmit(new Event('submit'));
      //   if (!createdDisaster?.id) return;
      // }

      // const disasterId = formData?.id || initialData?.id;
      // if (!disasterId) {
      //   setError("Please save the disaster first before verifying");
      //   return;
      // }

      setVerifying(true);                         // `${baseUrl}/api/disasters/`    //   router.post('/:id/verify-image', requireAuth, verifyImage);
      setError(null);


      // const response = await axios.post(`${baseUrl}/api/verify-image`, {
      // const response = await axios.post(`${baseUrl}/api/disasters/${formData.id}/verify-image`, {
      const response = await axios.post(`${baseUrl}/api/disasters/${formData.id}/verify-image`, {
        image_url: formData.image_url,
        description: formData.description,
        // ...formData, // Spread the entire formData object
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
          // "Content-Type": "application/json"
        }
      }
      );
      // const created = response.data.data;
      console.log(response);


      setFormData(prev => ({
        ...prev,
        // verification_status: response.data.verification_status || "verified"
        // id: created.id,
        verification_status: response.data.verification_status,
        verification_result: response.data.result  // 👈 save full Gemini response
      }));

      // setInitialData(response.data.data); // <- critical!

    } catch (err) {
      // alert("Verification failed: " + err.message);
      toast.error(`Verification failed: ${err.message}`, { position: 'top-right' });

      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };


  const handleToggleBroadcast = async (id, checked) => {
    if (!checked) return; // You only allow broadcasting, not undoing

    const confirm = window.confirm("Broadcast this verified disaster? This action cannot be undone");   // add alert dialog instead of window.confirm.
    if (!confirm) return;

    try {
      const { data } = await axios.post(`${baseUrl}/api/disasters/${id}/broadcast`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state to show it's broadcasted
      setFormData(prev => ({
        ...prev,
        broadcasted: true,
        verification_status: "verified" // Ensure it's marked as verified
      }));

      // alert(`✅ ${data.message}`);
      toast.error(`✅ ${data.message}`, { position: 'top-right' });


      // // Update disaster as broadcasted
      // setDisasters(prev =>
      //   prev.map(d => d.id === id ? { ...d, broadcasted: true } : d)
      // );


    } catch (err) {
      console.error("Broadcast error:", err);
      // alert(err.response?.data?.message || "Failed to broadcast.");
      toast.success("Failed to Broadcast disaster!")
      setError(err.response?.data?.message || "Failed to broadcast");
    }
  };



  return (
    <form
      onSubmit={handleSubmit}
      // className="grid gap-3"
      className="relative bg-white p-6 rounded shadow max-w-xl w-full space-y-4"

    >

      {/* Error message display */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Close Icon */}
      {/* <button
        onClick={onClose}
        type="button"
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
      >
        <X size={20} />
      </button>


      <h2 className="text-xl font-semibold mb-2">
        {isEdit ? "✏️ Edit Disaster" : "➕ Create Disaster"}
      </h2> */}


      {/* Form fields */}

      <input
        // {...register("title", { required: true })}
        type="text"
        name="title"
        placeholder="Disaster title"
        className="border px-3 py-2 rounded w-full"
        value={formData.title}
        // onChange={(e) => setTitle(e.target.value)}
        onChange={handleChange}
        required
      />
      <input
        // {...register("description", { required: true })}
        type="text"
        name="description"
        placeholder="Description"
        className="border px-3 py-2 rounded w-full"
        value={formData.description}
        // onChange={(e) => setDescription(e.target.value)}
        onChange={handleChange}
        required
      />
      <input
        // {...register("location_name", { required: true })}
        type="text"
        name="location_name"
        className="border px-3 py-2 rounded w-full"
        placeholder="Location name"
        value={formData.location_name}
        // onChange={(e) => setLocationName(e.target.value)}
        onChange={handleChange}
      />
      <input
        // {...register("location", { required: true })}
        type="text"
        name="location"
        placeholder="Location hex (mock for now)"
        className="border px-3 py-2 rounded w-full"
        value={formData.location}
        // onChange={(e) => setLocation(e.target.value)}
        onChange={handleChange}
      />
      <input
        // {...register("tags")}
        type="text"
        name="tags"
        placeholder="Tags (comma separated)"
        className="border px-3 py-2 rounded w-full"
        value={formData.tags}
        // onChange={(e) => setTags(e.target.value)}
        onChange={handleChange}

      />

      <input
        type="text"
        name="image_url"
        value={formData.image_url}
        placeholder="Image URL (optional)"
        className="w-full border px-3 py-2 rounded"
        // onChange={(e) => setImageUrl(e.target.value)}
        onChange={handleChange}
      />

      {/* {formData.image_url( */}
      {formData.image_url && (
        // {formData.image_url && (!initialData?.id || !formData?.id) && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleImageVerify}
            // className="px-4 py-1 bg-indigo-600 text-white rounded text-sm"
            className={`px-4 py-1 rounded text-sm ${verifying
              ? "bg-gray-400 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
              } text-white`}
            disabled={verifying}
          // disabled={verifying || !formData.image_url || (!initialData?.id || formData?.id)}
          // disabled={verifying || (!initialData?.id || formData.id)}
          // disabled={verifying || !(initialData?.id || formData?.id)}
          >
            {/* {verifying ? "Verifying..." : "🔍 Verify Image"} */}
            {verifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              "🔍 Verify Image"
            )}
          </button>

          {/* {formData.verification_status && formData.verification_result && ( */}
          {formData.verification_status && (
            <div>
              <span
                className={`px-2 py-1 text-xs rounded font-medium ${formData.verification_status === "verified"
                  ? "bg-green-100 text-green-700"
                  : formData.verification_status === "verified"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}
              >

                {/* Status: {formData.verification_status === "error"
                ? "Verification failed"
                : `Image: ${formData.verificationStatus}`} */}

                Status: {formData.verification_status}
              </span>

              {/* {d.verification_status === "verified" && !d.broadcasted && ( */}
              {/* {formData.verification_status === "verified" && (
  <div className="flex items-center gap-3 mt-3">
    <button
      type="button"
      id="broadcast-switch"
      onClick={() => setFormData(prev => ({ ...prev, broadcasted: !prev.broadcasted }))}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${formData.broadcasted ? 'focus:ring-green-500' : 'focus:ring-red-500'}
        bg-gray-200 border border-gray-300 
      `}
    >
      <span className={`
        inline-block h-5 w-5 transform rounded-full
        transition-transform duration-200 ease-in-out shadow-sm
        ${formData.broadcasted ? 'translate-x-6 bg-green-500' : 'translate-x-1 bg-red-500'}
      `} />
    </button>
    
    <label htmlFor="broadcast-switch" className="text-sm font-medium text-gray-700">
      {formData.broadcasted ? (
        <span className="flex items-center gap-1.5 text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          Broadcasted successfully!
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          Broadcast to all users
        </span>
      )}
    </label>
  </div>
)} */}

              {formData.verification_status === "verified" && (
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    id="broadcast-switch"
                    onClick={() => {
                      if (!formData.broadcasted && formData.id) {
                        handleToggleBroadcast(formData.id, true);
                      }
                    }}
                    className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        bg-white border border-gray-300
      `}
                    disabled={formData.broadcasted}
                  >
                    <span className={`
        inline-block h-5 w-5 transform rounded-full
        transition-transform duration-200 ease-in-out shadow-sm
        ${formData.broadcasted
                        ? 'translate-x-6 bg-green-500'
                        : 'translate-x-1 bg-red-500'
                      }
      `} />
                  </button>

                  <label htmlFor="broadcast-switch" className="text-sm font-medium text-gray-700">
                    {formData.broadcasted ? (
                      <span className="flex items-center gap-1.5 text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Broadcasted successfully!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Broadcast to all users
                      </span>
                    )}
                  </label>
                </div>
              )}


              {/* {formData.verification_status && ( */}
              {formData.verification_result && (
                // <div className="mt-2 px-3 py-2 bg-gray-100 border-l-4 border-yellow-500 text-sm text-gray-700 rounded shadow-sm">
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md max-h-[80px] overflow-y-auto text-xs">
                  <strong>Gemini Reason:</strong> {formData.verification_result}
                </div>
              )}

              {formData.verification_status === "unclear" || formData.verification_status === "fake" && (

                <button
                  type="button"
                  onClick={() => handleImageVerify()}
                  // className="mt-2 text-blue-600 text-sm"
                  className="mt-3 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition-colors"
                  disabled={verifying}
                >
                  Try verifying again
                </button>
              )}


            </div>
          )}

        </div>
      )}
      <div className="flex gap-2 justify-end mt-4">

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          // className="bg-green-600 text-white px-4 py-2 rounded"
          className={`bg-green-600 text-white px-4 py-2 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {/* {isEdit ? "Update Disaster" : "Create Disaster"} Disaster */}
          {/* {initialData ? "✏️ Edit Disaster" : "➕ Create Disaster"} Disaster */}

          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {initialData ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            initialData ? '✏️ Update Disaster' : '➕ Create Disaster'
          )}

        </button>
      </div>
    </form>
  );
};

export default DisasterForm;
