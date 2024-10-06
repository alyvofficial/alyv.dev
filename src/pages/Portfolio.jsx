import { useState, useEffect, } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getCountFromServer,
} from "firebase/firestore";
import { NavLink } from "react-router-dom";
import { useQuery } from "react-query";

export const Portfolio = () => {
  const { userData, firestore } = useAuthContext();
  const [projectType, setProjectType] = useState("graphic");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 4;
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [totalPages, setTotalPages] = useState(0);


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
        currentPage > 1 ? lastVisible : null,  // next page
        currentPage > 1 ? firstVisible : null  // previous page
      ),
    {
      staleTime: Infinity, // Verileri süresiz olarak önbellekte tut
      refetchOnMount: false, // Bileşen mount edildiğinde yeniden getirme
      refetchOnWindowFocus: false, // Pencere odağa geldiğinde yeniden getirme
      refetchOnReconnect: false, // Bağlantı yeniden kurulduğunda yeniden getirme
      cacheTime: Infinity,
    }
  );

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
      <label className="block mb-4">
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="p-2 border bg-black text-white rounded-lg focus:outline-none"
        >
          <option value="web">Vebsayt</option>
          <option value="graphic">Qrafik dizayn</option>
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
            <div className="w-full text-center text-xl">
              Hələ heç bir proyekt yoxdur
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`relative overflow-hidden rounded-xl shadow-lg ${
                  projectType === "web"
                    ? "sm:w-full md:w-[49%] lg:w-[33%] aspect-video bg-cover bg-center"
                    : "sm:w-full md:w-[49%] lg:w-[24%] aspect-[4/5] bg-cover bg-center"
                }`}
                style={{
                  backgroundImage: `url(${project.imageUrl})`,
                }}
              >
                <div className="absolute inset-0 bg-transparent opacity-0 hover:bg-black/50 hover:opacity-100 flex items-center justify-center transition">
                  <div className="flex flex-col items-center">
                    <div className="text-xl text-center text-white">
                      {project.caption} · {userData.Name} {userData.Surname}
                    </div>
                    <NavLink
                      to={
                        projectType === "web"
                          ? project.githubLink
                          : project.graphicLink
                      }
                      target="_blank"
                      className="mt-2 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white text-sm font-bold py-2 px-3 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105"
                    >
                      Baxmaq
                    </NavLink>
                  </div>
                </div>
              </div>
            ))
          )}

         </div>
        {/* Pagination Controls */}
        <div className="flex items-center my-4 space-x-4 text-white">
          <button
            onClick={() => handlePagination("prev")}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:hidden disabled:cursor-not-allowed"
          >
            Əvvəl
          </button>
          <span className="font-medium text-white">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePagination("next")}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:hidden disabled:cursor-not-allowed"
          >
            Növbəti
          </button>
        </div>
      </div>
    </section>
  );
};
