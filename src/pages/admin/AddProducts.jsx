import { useState } from "react";
import { useAuthContext } from "../../providers/AuthProvider";
import imageCompression from "browser-image-compression";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AddProducts = () => {
  const { userData, myStorage, firestore } = useAuthContext();
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
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
      const storageRef = ref(myStorage, `products/${compressedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image: " + error.message);
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
      toast.error("Error compressing/uploading image: " + error.message);
      throw error;
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !description || !price || !imageFile) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const imageUrl = await handleImageUpload(imageFile);

      const productData = {
        name: productName,
        description,
        price: parseFloat(price),
        imageUrl,
        addedBy: `${userData.Name} ${userData.Surname}`,
        dateAdded: new Date(),
      };

      await addDoc(collection(firestore, "products"), productData);

      toast.success("Product added successfully!");
      setProductName("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="w-full mx-auto my-4 rounded-lg bg-[#232323] text-white p-5">
      <ToastContainer position="top-center" autoClose={2000} />
      
      <label className="flex flex-col mb-4">
        <span>Məhsulun adı:</span>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <span>Açıqlama:</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <span>Qiymət:</span>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="mt-1 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </label>

      <button
        onClick={handleAddProduct}
        disabled={uploading}
        className={`px-4 py-2 bg-blue-500 text-white rounded ${
          uploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
        } focus:outline-none focus:ring-indigo-500`}
      >
        {uploading ? "Uploading..." : "Add Product"}
      </button>

      {uploadProgress > 0 && (
        <div className="mt-2 text-gray-700">
          Upload Progress: {Math.round(uploadProgress)}%
        </div>
      )}
    </section>
  );
};
