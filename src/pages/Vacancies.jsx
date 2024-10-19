import { useState, useEffect, useMemo, useRef } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getCountFromServer,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import { useQuery } from "react-query";
import "react-toastify/dist/ReactToastify.css";
import "jodit";
import JoditEditor from "jodit-react";

export const Vacancies = () => {
  const { firestore, userData } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const vacanciesPerPage = 6;
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const editorRef = useRef(null);
  const [expandedVacancyId, setExpandedVacancyId] = useState(null);

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

  // State for editing vacancies
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [formValues, setFormValues] = useState({
    company: "",
    description: "",
    emailOrLink: "",
    field: "",
    jobType: "",
    location: "",
    postedBy: "",
    postingDate: "",
    salary: "",
    title: "",
  });

  const fetchVacancies = async (startAfterDoc = null, endBeforeDoc = null) => {
    let vacanciesQuery = query(
      collection(firestore, "vacancies"),
      orderBy("postingDate", "desc"),
      limit(vacanciesPerPage)
    );

    if (startAfterDoc) {
      // Fetch next page after the last visible document
      vacanciesQuery = query(
        collection(firestore, "vacancies"),
        orderBy("postingDate", "desc"),
        startAfter(startAfterDoc),
        limit(vacanciesPerPage)
      );
    } else if (endBeforeDoc) {
      // Fetch previous page before the first visible document
      vacanciesQuery = query(
        collection(firestore, "vacancies"),
        orderBy("postingDate", "desc"),
        endBefore(endBeforeDoc),
        limit(vacanciesPerPage)
      );
    }

    const querySnapshot = await getDocs(vacanciesQuery);
    const fetchedVacancies = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Set both first and last visible documents
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setFirstVisible(querySnapshot.docs);

    return fetchedVacancies;
  };

  const fetchTotalPages = async () => {
    const collectionRef = collection(firestore, "vacancies");
    const count = await getCountFromServer(collectionRef);
    const totalVacancies = count.data().count;
    const calculatedTotalPages = Math.ceil(totalVacancies / vacanciesPerPage);
    setTotalPages(calculatedTotalPages);
  };

  const { data: vacancies, isLoading } = useQuery(
    ["vacancies", currentPage],
    () => fetchVacancies(currentPage > 1 ? lastVisible : null),
    {
      enabled: !!currentPage,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      cacheTime: Infinity,
      keepPreviousData: true,
    }
  );

  const handleDeleteVacancy = async (vacancy) => {
    if (userData && userData.email === "alyvdev@gmail.com") {
      try {
        const vacancyDocRef = doc(firestore, "vacancies", vacancy.id);
        await deleteDoc(vacancyDocRef);
        toast.success("Vacancy successfully deleted");
      } catch (error) {
        toast.error("Error deleting vacancy");
      }
    } else {
      toast.error("You don't have permission to delete vacancies!");
    }
  };

  const handleUpdateVacancy = async (vacancy) => {
    if (userData && userData.email === "alyvdev@gmail.com") {
      try {
        const vacancyDocRef = doc(firestore, "vacancies", vacancy.id);

        // Convert postingDate back to Firestore Timestamp
        const updatedData = {
          ...formValues,
          postingDate: formValues.postingDate
            ? Timestamp.fromDate(new Date(formValues.postingDate))
            : null,
        };

        await updateDoc(vacancyDocRef, updatedData);
        toast.success("Vacancy successfully updated");
        setEditingVacancy(null);
      } catch (error) {
        toast.error("Error updating vacancy");
      }
    } else {
      toast.error("You don't have permission to update vacancies!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleEditVacancy = (vacancy) => {
    setEditingVacancy(vacancy);
    setFormValues({
      company: vacancy.company || "",
      dateAdded: vacancy.dateAdded || "",
      description: vacancy.description || "",
      emailOrLink: vacancy.emailOrLink || "",
      field: vacancy.field || "",
      jobType: vacancy.jobType || "", // Ensure this is initialized
      location: vacancy.location || "",
      postedBy: vacancy.postedBy || "",
      postingDate:
        vacancy.postingDate instanceof Timestamp
          ? vacancy.postingDate.toDate().toLocaleDateString()
          : vacancy.postingDate,
      salary: vacancy.salary || "",
      title: vacancy.title || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingVacancy(null);
    setFormValues({
      company: "",
      description: "",
      emailOrLink: "",
      field: "",
      jobType: "",
      location: "",
      postedBy: "",
      postingDate: "",
      salary: "",
      title: "",
    });
  };

  useEffect(() => {
    fetchTotalPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggleDescription = (vacancyId) => {
    setExpandedVacancyId((prevId) => (prevId === vacancyId ? null : vacancyId));
  };

  // Pagination handler for both directions
  const handlePagination = async (direction) => {
    if (direction === "next") {
      // Load the next page using the last visible document
      setCurrentPage((prev) => prev + 1);
      await fetchVacancies(lastVisible);
    } else if (direction === "prev" && currentPage > 1) {
      // Load the previous page using the first visible document
      setCurrentPage((prev) => prev - 1);
      await fetchVacancies(null, firstVisible);
    }
  };

  return (
    <section className="w-full mx-auto my-4 p-5">
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="text-white text-center col-span-3 rounded-lg shadow-md">
            Loading vacancies...
          </div>
        ) : vacancies.length > 0 ? (
          vacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="p-6 bg-gray-800 text-white rounded-lg shadow-md hover:shadow-xl transition duration-200"
            >
              <h2 className="text-xl font-bold mb-2">{vacancy.title}</h2>
              <p className="text-[#52e0c4] mb-2">{vacancy.company}</p>
              <button
                onClick={() => toggleDescription(vacancy.id)}
                className="text-blue-500 underline mb-4"
              >
                {expandedVacancyId === vacancy.id
                  ? "Hide Description"
                  : "Show Description"}
              </button>

              {expandedVacancyId === vacancy.id && (
                <div
                  className="text-white mb-4"
                  dangerouslySetInnerHTML={{ __html: vacancy.description }}
                />
              )}
              <p className="text-sm text-gray-400 mb-2">
                Maaş: {vacancy.salary || "Razılaşma yolu ilə"}
              </p>
              <p className="text-sm text-gray-400 mb-2">
                İş növü: {vacancy.jobType}
              </p>
              <p className="text-sm text-gray-400 mb-2">
                Ərazi / Bölgə: {vacancy.location}
              </p>
              <p className="text-sm text-gray-400 mb-2">
                {vacancy.postingDate instanceof Timestamp
                  ? vacancy.postingDate.toDate().toLocaleDateString()
                  : vacancy.postingDate}
              </p>

              {userData && userData.email === "alyvdev@gmail.com" && (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleEditVacancy(vacancy)}
                    className="text-blue-500 rounded  transition duration-200"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteVacancy(vacancy)}
                    className="text-red-500 rounded  transition duration-200"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              )}

              {editingVacancy && editingVacancy.id === vacancy.id && (
                <div className="mt-4 grid gap-2">
                  <input
                    type="text"
                    name="title"
                    value={formValues.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="p-2 bg-gray-700 text-white w-full rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="text"
                    name="company"
                    value={formValues.company}
                    onChange={handleChange}
                    placeholder="Company"
                    className="p-2 bg-gray-700 text-white w-full rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                  <JoditEditor
                    ref={editorRef}
                    value={formValues.description}
                    config={config}
                    tabIndex={1}
                    onBlur={(newContent) =>
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        description: newContent,
                      }))
                    }
                    className="text-black"
                  />

                  <input
                    type="text"
                    name="salary"
                    value={formValues.salary}
                    onChange={handleChange}
                    placeholder="Salary"
                    className="p-2 bg-gray-700 text-white w-full rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                  <select
                    name="jobType"
                    value={formValues.jobType}
                    onChange={handleChange} // Ensure this is set to handleChange
                    className="sm:w-full lg:w-1/3 p-2 border bg-[#232323] text-white rounded"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="intern">Intern</option>
                    <option value="freelance">Freelance</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>

                  <input
                    type="text"
                    name="emailOrLink"
                    value={formValues.emailOrLink}
                    onChange={handleChange}
                    placeholder="Email or Link"
                    className="p-2 bg-gray-700 text-white w-full rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="text"
                    name="field"
                    value={formValues.field}
                    onChange={handleChange}
                    placeholder="Field"
                    className="p-2 bg-gray-700 text-white w-full rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="text"
                    name="postedBy"
                    value={formValues.postedBy}
                    onChange={handleChange}
                    placeholder="Posted By"
                    className="p-2 bg-gray-700 text-white w-full rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="date"
                    name="postingDate"
                    value={formValues.postingDate}
                    onChange={handleChange}
                    placeholder="Posting Date"
                    className="p-2 bg-gray-700 text-white w-full"
                  />
                  <button
                    onClick={() => handleUpdateVacancy(vacancy)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mt-2 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-white text-center col-span-3 p-6 bg-gray-800 rounded-lg shadow-md">
            No vacancies available
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center my-4 space-x-4 text-white">
        <button
          onClick={() => handlePagination("prev")}
          disabled={currentPage === 1}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaArrowAltCircleLeft size={20} />
        </button>
        <span className="text-white">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePagination("next")}
          disabled={currentPage === totalPages}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaArrowAltCircleRight size={20} />
        </button>
      </div>
    </section>
  );
};
