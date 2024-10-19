import { useState, useRef, useMemo } from "react";
import { useAuthContext } from "../../providers/AuthProvider";
import { collection, addDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "jodit";
import JoditEditor from "jodit-react";
export const AddVacancies = () => {
  const { userData, firestore } = useAuthContext();
  const [vacancyTitle, setVacancyTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [field, setField] = useState("");
  const [postingDate, setPostingDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  const config = useMemo(() => {
    return {
      autofocus: true,
      uploader: {
        insertImageAsBase64URI: true,
      },
      enter: "BR",
      saveHeightInStorage: true,
      saveModeInStorage: true,
      height: 500,
    };
  }, []);

  const handleAddVacancy = async () => {

    setUploading(true);
    try {
    const vacancyData = {
      title: vacancyTitle,
      description: content, // Use content from JoditEditor
      salary,
      company,
      emailOrLink: email,
      location,
      jobType,
      field,
      postingDate: new Date(postingDate),
      postedBy: `${userData.Name} ${userData.Surname}`,
    };

      await addDoc(collection(firestore, "vacancies"), vacancyData);

      toast.success("Vacancy added successfully!");
      setVacancyTitle("");
      setContent("");
      setCompany("");
      setEmail("");
      setLocation("");
      setJobType("full-time");
      setField("");
      setPostingDate("");
    } catch (error) {
      console.error("Error adding vacancy:", error);
      toast.error("Error adding vacancy: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="w-full mx-auto my-4 rounded-lg bg-[#232323] text-white p-5">
      <ToastContainer position="top-center" autoClose={2000} />

      <label className="flex flex-col mb-4">
        <span>İş Başlığı:</span>
        <input
          type="text"
          value={vacancyTitle}
          onChange={(e) => setVacancyTitle(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4 text-black">
        <JoditEditor
                ref={editorRef}
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
                onChange={(newContent) => {
                  setContent(newContent);
                }}
                className="text-black"
              />
      </label>

      <label className="flex flex-col mb-4">
        <span>Maaş:</span>
        <input
          type="text"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <span>Şirkət Adı:</span>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <span>Email / Link:</span>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <span>İş Yeri / Ərazi:</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <span>İş Tipi:</span>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        >
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
          <option value="intern">Intern</option>
          <option value="freelance">Freelance</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </label>

      <label className="flex flex-col mb-4">
        <span>Sahə:</span>
        <input
          type="text"
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <label className="flex flex-col mb-4">
        <span>Paylaşılma Tarixi:</span>
        <input
          type="date"
          value={postingDate}
          onChange={(e) => setPostingDate(e.target.value)}
          className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
        />
      </label>

      <button
        onClick={handleAddVacancy}
        disabled={uploading}
        className={`px-4 py-2 bg-blue-500 text-white rounded ${
          uploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
        } focus:outline-none focus:ring-indigo-500`}
      >
        {uploading ? "Uploading..." : "Əlavə et"}
      </button>
    </section>
  );
};
