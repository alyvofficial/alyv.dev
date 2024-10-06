import { useState } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import imageCompression from "browser-image-compression";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css";

export const AddProject = () => {
  const { userData, myStorage, firestore } = useAuthContext();
  const [projectType, setProjectType] = useState("graphic");
  const [caption, setCaption] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [graphicLink, setGraphicLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const storageRef = ref(
        myStorage,
        `projects/${projectType}/${compressedFile.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress); // Update the upload progress
          },
          (error) => {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image: " + error.message); // Use Toastify
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error compressing/uploading image:", error);
      toast.error("Error compressing/uploading image: " + error.message); // Use Toastify
      throw error; // Re-throw the error to be caught in handleAddProject
    }
  };

  const handleAddProject = async () => {
    if (!imageFile || !caption || !projectType) {
      toast.warn("Please fill in all required fields."); // More user-friendly alert with Toastify
      return;
    }

    setUploading(true);
    setUploadProgress(0); // Reset upload progress at the start
    try {
      const imageUrl = await handleImageUpload(imageFile);

      const projectData = {
        caption,
        imageUrl,
        createdBy: [userData.Name, userData.Surname].join(" "),
        dateAdded: new Date(), // Firestore Timestamp is generally preferred: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (projectType === "web") {
        projectData.githubLink = githubLink;
        await addDoc(collection(firestore, "webProjects"), projectData);
      } else if (projectType === "graphic") {
        projectData.graphicLink = graphicLink; // Add graphic link to project data
        await addDoc(collection(firestore, "graphicDesigns"), projectData);
      }

      toast.success("Project added successfully"); // Use Toastify
      // Reset form after successful submission
      setProjectType("web"); // Reset to web for consistency
      setCaption("");
      setGithubLink("");
      setGraphicLink(""); // Reset graphic link
      setImageFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Error adding project: " + error.message); // Use Toastify
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="w-full mx-auto mt-4 bg-white rounded-lg">
      <ToastContainer position="top-center" autoClose={2000} />
      <label className="block mb-4">
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="p-1 mr-2 border border-gray-300 rounded-lg focus:outline-none"
        >
          <option value="web">Website</option>
          <option value="graphic">Qrafik dizayn</option>
        </select>
      </label>

      {projectType && (
        <>
          <label className="block mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </label>
          <label className="flex flex-col mb-4">
            <span className="text-gray-700">Başlıq:</span>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="sm:w-full lg:w-1/3 p-2 border border-gray-300 rounded"
            />
          </label>
          {projectType === "web" && (
            <label className="flex flex-col mb-4">
              <span className="text-gray-700">GitHub Link:</span>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="sm:w-full lg:w-1/3  p-2 border border-gray-300 rounded"
              />
            </label>
          )}
          {projectType === "graphic" && (
            <label className="flex flex-col mb-4">
              <span className="text-gray-700">Link:</span>
              <input
                type="url"
                value={graphicLink}
                onChange={(e) => setGraphicLink(e.target.value)}
                className="sm:w-full lg:w-1/3 p-2 border border-gray-300 rounded"
              />
            </label>
          )}
        </>
      )}
      <button
        onClick={handleAddProject}
        disabled={uploading}
        className={`px-4 py-2 bg-blue-500 text-white rounded ${
          uploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
        } focus:outline-none focus:ring-indigo-500`}
      >
        {uploading ? "Yüklənir..." : "Əlavə et"}
      </button>
      {/* Optionally display upload progress */}
      {uploadProgress > 0 && (
        <div className="mt-2 text-gray-700">
          Upload Progress: {Math.round(uploadProgress)}%
        </div>
      )}
    </section>
  );
};
