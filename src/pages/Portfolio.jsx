import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { NavLink } from "react-router-dom";
import { useQuery } from "react-query";
import { ref, deleteObject } from "firebase/storage";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../providers/LanguageProvider";

export const Portfolio = () => {
  const { firestore, userData, myStorage } = useAuthContext();
  const [projectType, setProjectType] = useState("graphic");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 8;
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const { translations } = useLanguage();

  // Düzenleme için gereken state değişkenleri
  const [editingProject, setEditingProject] = useState(null);
  const [newCaption, setNewCaption] = useState("");
  const [newLink, setNewLink] = useState("");

  const fetchProjects = async (
    projectType,
    articlesPerPage,
    startAfterDoc = null,
    endBeforeDoc = null
  ) => {
    const collectionRef =
      projectType === "web"
        ? collection(firestore, "webProjects")
        : collection(firestore, "graphicDesigns");

    let projectsQuery = query(
      collectionRef,
      orderBy("dateAdded", "desc"),
      limit(articlesPerPage)
    );

    if (startAfterDoc) {
      projectsQuery = query(
        collectionRef,
        orderBy("dateAdded", "desc"),
        startAfter(startAfterDoc),
        limit(articlesPerPage)
      );
    } else if (endBeforeDoc) {
      projectsQuery = query(
        collectionRef,
        orderBy("dateAdded", "desc"),
        endBefore(endBeforeDoc),
        limit(articlesPerPage)
      );
    }

    const querySnapshot = await getDocs(projectsQuery);
    const fetchedProjects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setFirstVisible(querySnapshot.docs[0]);

    return fetchedProjects;
  };

  const fetchTotalPages = async (projectType) => {
    const collectionRef =
      projectType === "web"
        ? collection(firestore, "webProjects")
        : collection(firestore, "graphicDesigns");

    const count = await getCountFromServer(collectionRef);
    const totalProjects = count.data().count;
    const calculatedTotalPages = Math.ceil(totalProjects / projectsPerPage);
    setTotalPages(calculatedTotalPages);
  };

  const { data: projects, isLoading } = useQuery(
    ["projects", projectType, currentPage],
    () =>
      fetchProjects(
        projectType,
        projectsPerPage,
        currentPage > 1 ? lastVisible : null, // next page
        currentPage > 1 ? firstVisible : null // previous page
      ),
    {
      enabled: !!projectType && !!currentPage, // sadece projectType ve currentPage dolu olduğunda istek yap
      staleTime: Infinity, // Veriyi süresiz olarak önbellekte tut
      refetchOnMount: false, // Bileşen montaj edildiğinde yeniden istek yapma
      refetchOnWindowFocus: false, // Pencere odağa geldiğinde yeniden istek yapma
      refetchOnReconnect: false, // Bağlantı yeniden kurulduğunda istek yapma
      cacheTime: Infinity, // Veriyi süresiz olarak önbellekte tut
      keepPreviousData: true, // Yeni veri gelene kadar önceki veriyi göster
    }
  );
  

  // Proje silme fonksiyonu
  const handleDeleteProject = async (project) => {
    if (userData && userData.email === "alyvdev@gmail.com") {
      try {
        // Firestore'dan projeyi sil
        const projectDocRef = doc(
          firestore,
          projectType === "web" ? "webProjects" : "graphicDesigns",
          project.id
        );
        await deleteDoc(projectDocRef);

        // Firebase Storage'dan projeye ait resmi sil
        const imageRef = ref(myStorage, project.imageUrl);
        await deleteObject(imageRef);

        // Silme işleminden sonra projeleri yeniden yükle
        toast.success("Proyekt uğurla silindi");
        await fetchProjects(projectType, projectsPerPage);
      } catch (error) {
        console.error("Proyekt güncəllənərkən xəta baş verdi:", error);
        toast.error("Proyekt güncəllənərkən xəta baş verdi");
      }
    } else {
      toast.error("Proyekti silməyə icazəniz yoxdu!");
    }
  };

  // Proje güncelleme fonksiyonu
  const handleUpdateProject = async (project) => {
    if (userData && userData.email === "alyvdev@gmail.com") {
      try {
        const projectDocRef = doc(
          firestore,
          projectType === "web" ? "webProjects" : "graphicDesigns",
          project.id
        );

        // Firestore'da güncelleme
        await updateDoc(projectDocRef, {
          caption: newCaption,
          [projectType === "web" ? "githubLink" : "graphicLink"]: newLink,
        });

        // Ön bellekte güncelleme
        const updatedProjects = projects.map((p) =>
          p.id === project.id
            ? {
                ...p,
                caption: newCaption,
                [projectType === "web" ? "githubLink" : "graphicLink"]: newLink,
              }
            : p
        );

        // Yeni güncellenmiş projeleri setState ile güncelle
        setEditingProject(updatedProjects);
        toast.success("Proyekt uğurla güncəlləndi");
        setEditingProject(null);
      } catch (error) {
        console.error("Proyekt güncəllənərkən xəta baş verdi:", error);
        toast.error("Proyekt güncəllənərkən xəta baş verdi");
      }
    } else {
      toast.error("Faylı güncəlləməyə icazəniz yoxdu!");
    }
  };

  useEffect(() => {
    fetchTotalPages(projectType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType]);

  const handlePagination = async (direction) => {
    if (direction === "next") {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  return (
    <section className="w-full mx-auto p-4 bg-black min-h-screen">
      <ToastContainer position="top-center" autoClose={2000} />
      <label className="block mb-4">
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="p-2 border bg-black text-white rounded-lg focus:outline-none"
        >
          <option value="web">{translations.website}</option>
          <option value="graphic">{translations.graphicDesign}</option>
        </select>
      </label>

      <div className="w-full">
        <div className="flex flex-wrap items-center gap-3">
          {isLoading ? ( // Check if loading
            <div className="absolute inset-0 z-50 w-full h-screen flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-lg text-gray-700">Proyektlər yüklənir...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="w-full text-center text-xl text-white">
              Hələ heç bir proyekt yoxdur
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`relative overflow-hidden rounded-xl shadow-lg ${
                  projectType === "web"
                    ? "sm:w-full md:w-[49%] lg:w-[32%] aspect-video bg-cover bg-center"
                    : "sm:w-full md:w-[49%] lg:w-[24%] aspect-[4/5] bg-cover bg-center"
                }`}
                style={{
                  backgroundImage: `url(${project.imageUrl})`,
                }}
              >
                {/* Düzenleme butonu */}
                {userData && userData.email === "alyvdev@gmail.com" && (
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setNewCaption(project.caption);
                      setNewLink(
                        projectType === "web"
                          ? project.githubLink
                          : project.graphicLink
                      );
                    }}
                    className="absolute z-50 top-2 left-2 text-xl text-white p-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <MdEdit size={25} />
                  </button>
                )}
                {/* Hover ile silme butonunu göster */}
                {userData && userData.email === "alyvdev@gmail.com" && (
                  <button
                    onClick={() => handleDeleteProject(project)}
                    className="absolute z-50 top-2 right-2 text-xl text-red-600 p-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <MdDelete size={25} />
                  </button>
                )}
                <div className="absolute inset-0 bg-transparent opacity-0 hover:bg-black/50 hover:opacity-100 flex items-center justify-center transition">
                  <div className="flex flex-col items-center">
                    <NavLink
                      to={
                        projectType === "web"
                          ? project.githubLink
                          : project.graphicLink
                      }
                      target="_blank"
                      className=" text-white text-xl font-bold shadow-lg transition-transform duration-300 transform hover:scale-105 underline"
                    >
                      {project.caption}
                    </NavLink>
                  </div>
                </div>
                {editingProject && editingProject.id === project.id && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="p-4 rounded-lg bg-white text-black">
                      <input
                        type="text"
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        placeholder="Başlıq"
                        className="p-2 border rounded mb-2 w-full"
                      />
                      <input
                        type="text"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        placeholder="Link"
                        className="p-2 border rounded mb-2 w-full"
                      />
                      <button
                        onClick={() => handleUpdateProject(project)}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                      >
                        Güncəllə
                      </button>
                      <button
                        onClick={() => setEditingProject(null)}
                        className="ml-2 px-4 py-2 bg-gray-300 rounded"
                      >
                        İmtina
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center my-4 space-x-4 text-white">
          <button
            onClick={() => handlePagination("prev")}
            disabled={currentPage === 1}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowAltCircleLeft size={20} />
          </button>
          <span className="font-medium text-white">
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
      </div>
    </section>
  );
};
