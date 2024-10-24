import { useState, useEffect, useRef, useMemo } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getCountFromServer,
} from "firebase/firestore";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "jodit";
import JoditEditor from "jodit-react";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { MdDelete, MdEdit, MdCancel } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { useLanguage } from "../providers/LanguageProvider";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";

export const Articles = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const { userData, firestore } = useAuthContext();
  const [editArticleId, setEditArticleId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 8;
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const { translations } = useLanguage();

  const config = useMemo(
    () => ({
      readonly: false,
      height: "500px",
      uploader: { insertImageAsBase64URI: true },
    }),
    []
  );

  useEffect(() => {
    setCategories([
      translations.programming,
      translations.graphicDesign,
      translations.sports,
      translations.education,
      translations.other,
    ]);
  }, [translations]);

  const fetchArticles = async () => {
    const articlesCollection = collection(firestore, "articles");
    const articlesQuery = query(
      articlesCollection,
      orderBy("createdAt", "desc"),
      limit(articlesPerPage)
    );

    const querySnapshot = await getDocs(articlesQuery);
    const articlesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setFirstVisible(querySnapshot.docs[0]);
    return articlesData;
  };

  const fetchTotalPages = async () => {
    const articlesCollection = collection(firestore, "articles");
    const count = await getCountFromServer(articlesCollection);
    const totalArticles = count.data().count;
    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    setTotalPages(totalPages);
  };

  useEffect(() => {
    fetchArticles();
    fetchTotalPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMoreArticles = async (direction) => {
    const articlesCollection = collection(firestore, "articles");
    let articlesQuery;

    if (direction === "next" && lastVisible) {
      articlesQuery = query(
        articlesCollection,
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(articlesPerPage)
      );
    } else if (direction === "prev" && firstVisible) {
      articlesQuery = query(
        articlesCollection,
        orderBy("createdAt", "desc"),
        endBefore(firstVisible),
        limit(articlesPerPage)
      );
    } else {
      return;
    }

    const querySnapshot = await getDocs(articlesQuery);
    const articlesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setFirstVisible(querySnapshot.docs[0]);
    return articlesData;
  };

  const handlePagination = async (direction) => {
    await loadMoreArticles(direction);
    if (direction === "next") {
      setCurrentPage((prev) => prev + 1);
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const isAdmin = userData && userData.email === "alyvdev@gmail.com";

  const { data: articles } = useQuery(
    ["articles"],
    async () => {
      const querySnapshot = await getDocs(collection(firestore, "articles"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    {
      staleTime: Infinity, // Verileri süresiz olarak önbellekte tut
      refetchOnMount: false, // Bileşen mount edildiğinde yeniden getirme
      refetchOnWindowFocus: false, // Pencere odağa geldiğinde yeniden getirme
      refetchOnReconnect: false, // Bağlantı yeniden kurulduğunda yeniden getirme
      cacheTime: Infinity, // Verileri süresiz olarak önbellekte tut
    }
  );

  const deleteArticle = async (id) => {
    if (!articles) return;
    const articleToDelete = articles.find((article) => article.id === id);
    if (
      articleToDelete &&
      (articleToDelete.userId === userData.uid || isAdmin)
    ) {
      try {
        await deleteDoc(doc(firestore, "articles", id));
        queryClient.invalidateQueries("articles");
        toast.success("Məqalə silindi!");
      } catch (error) {
        toast.error("Məqalə silinə bilmədi!");
      }
      queryClient.invalidateQueries("articles");
    } else {
      toast.error("Bu məqaləyi silməyə icazəniz yoxdur!");
    }
  };

  const handleEditChange = (e, field) => {
    if (field === "title") {
      setEditTitle(e.target.value);
    } else {
      setEditContent(e);
    }
  };

  const updateArticle = async (id) => {
    try {
      const articleRef = doc(firestore, "articles", id);
      queryClient.invalidateQueries("articles");
      const updatedContent = editorRef.current.value;
      await updateDoc(articleRef, {
        title: editTitle,
        content: updatedContent,
        updatedAt: new Date(),
      });
      queryClient.setQueryData(["articles"], (oldArticles) =>
        oldArticles.map((article) =>
          article.id === id
            ? { ...article, title: editTitle, content: updatedContent }
            : article
        )
      );
      toast.success("Məqalə güncəlləndi!");
      setEditArticleId(null);
    } catch (error) {
      console.error("Güncellemeye hata:", error);
      toast.error("Məqalə güncəllənə bilmədi: " + error.message);
    }
  };



  const filteredAndSortedArticles = useMemo(() => {
    if (!articles) return { currentArticles: [], totalPages: 0 };
    const filteredArticles = articles
      ?.filter((article) => {
        const matchesSearch = article.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return b.createdAt.seconds - a.createdAt.seconds;
        } else if (sortOrder === "oldest") {
          return a.createdAt.seconds - b.createdAt.seconds;
        } else if (sortOrder === "A-Z") {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });

    const totalArticles = filteredArticles.length;
    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    const currentArticles = filteredArticles.slice(
      (currentPage - 1) * articlesPerPage,
      currentPage * articlesPerPage
    );

    return { currentArticles, totalPages, totalArticles }; // totalArticles'ı ekleyin
  }, [articles, searchQuery, selectedCategory, sortOrder, currentPage]);

  return (
    <section className="p-5 flex flex-col overflow-y-auto w-full relative bg-black min-h-screen">
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="flex sm:flex-col lg:flex-row-reverse sm:items-start lg:items-center lg:justify-between gap-3 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-1 ps-10 text-sm focus:outline-none border bg-[#232323] text-white rounded-lg"
            placeholder={translations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-auto flex">
          <label htmlFor="sortOrder" className=""></label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-1 mr-2 border bg-[#232323] text-white rounded-lg focus:outline-none"
          >
            <option value="newest">{translations.sortOld}</option>
            <option value="oldest">{translations.sortNew}</option>
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
          </select>

          <label htmlFor="category" className=""></label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1 border bg-[#232323] text-white rounded-lg focus:outline-none"
          >
            <option value="all">{translations.sortAll}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap  gap-4">
        {filteredAndSortedArticles.currentArticles.length > 0 ? (
          filteredAndSortedArticles.currentArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => {
                if (editArticleId !== article.id) {
                  navigate(`/articles/${article.id}`);
                }
              }}
              className={`p-5 bg-[#232323] shadow-lg rounded-xl relative lg:${
                editArticleId === article.id ? "" : ""
              } cursor-pointer ${
                editArticleId === article.id ? "bg-[#232323]" : ""
              }`}
            >
              <h3 className="text-lg sm:mr-5 lg:mr-0 font-semibold text-white">
                {article.title}
              </h3>
              <span className="text-sm text-[#64ffda] mb-2">
                {article.category}
              </span>
              <p className="text-xs text-gray-500 mb-1">
                {format(
                  new Date(article.createdAt.seconds * 1000),
                  "dd/MM/yyyy"
                )}
              </p>

              {/* Edit and Delete Buttons */}
              {userData && (article.userId === userData.uid || isAdmin) && (
                <div className="w-full flex justify-end gap-2">
                  {editArticleId !== article.id && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditArticleId(article.id);
                          setEditTitle(article.title);
                          setEditContent(article.content);
                        }}
                        className="text-white "
                      >
                        <MdEdit size={20}/>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteArticle(article.id);
                        }}
                        className="text-red-500"
                      >
                        <MdDelete size={20}/>
                      </button>
                    </>
                  )}

                  {/* Edit Article Section */}
                  {editArticleId === article.id && (
                    <div className="w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => handleEditChange(e, "title")}
                        className="block w-full my-2 p-2 border bg-[#232323] text-white rounded"
                      />
                      <JoditEditor
                        ref={editorRef}
                        value={editContent}
                        config={config}
                        onChange={(newContent) => handleEditChange(newContent)}
                        className="w-full text-black"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateArticle(article.id);
                        }}
                        className="px-3 py-1 mt-2 bg-blue-500 text-white text-sm rounded"
                      >
                        <RxUpdate />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditArticleId(null);
                        }}
                        className="mx-3 px-3 py-1 bg-red-500 text-white text-sm rounded"
                      >
                        <MdCancel />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          // Display message when no articles are found
          <div className="w-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-gray-700">
                {translations.noArticlesFound}
              </p>
            </div>
          </div>
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
    </section>
  );
};
