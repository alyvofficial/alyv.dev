import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import showdown from "showdown";
import hljs from 'highlight.js';
import './Highlight.css'; // or any other theme

export const Articles = () => {
  const { user, firestore } = useAuthContext();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editArticleId, setEditArticleId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", { color: [] }, "image"],
      [{ "code-block": true }],
      ["clean"],
      [{ font: [] }],
    ],
  };
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "indent",
    "image",
    "code-block",
    "color",
    "font",
  ];

  const isAdmin = user && user.email === "alyvdev@gmail.com";
  const articleContentRef = useRef(null);

  const fetchArticles = async () => {
    const articlesRef = collection(firestore, "articles");
    const q = query(articlesRef);
    const querySnapshot = await getDocs(q);
    const articlesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setArticles(articlesList);
  };

  const deleteArticle = async (id) => {
    const articleToDelete = articles.find((article) => article.id === id);
    if (articleToDelete.userId === user.uid || isAdmin) {
      try {
        await deleteDoc(doc(firestore, "articles", id));
        toast.success("Məqalə silindi!");
        fetchArticles();
      } catch (error) {
        toast.error("Məqalə silinə bilmədi!");
      }
    } else {
      toast.error("Bu məqaləyi silməyə icazəniz yoxdur!");
    }
  };

  const handleEditChange = (e, field) => {
    if (field === "title") {
      setEditTitle(e.target.value);
    } else {
      setEditContent(e.target.value);
    }
  };

  const updateArticle = async (id) => {
    try {
      const articleRef = doc(firestore, "articles", id);
      await updateDoc(articleRef, {
        title: editTitle,
        content: editContent,
        updatedAt: new Date(),
      });
      toast.success("Məqalə güncəlləndi!");
      setEditArticleId(null);
      fetchArticles();
    } catch (error) {
      toast.error("Məqalə güncəllənə bilmədi!");
    }
  };

  const toggleLike = async (articleId) => {
    try {
      const articleRef = doc(firestore, "articles", articleId);
      const article = articles.find((article) => article.id === articleId);

      if (article.likes.includes(user.uid)) {
        await updateDoc(articleRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(articleRef, {
          likes: arrayUnion(user.uid),
        });
      }

      fetchArticles();
    } catch (error) {
      console.error("Bəyənmək baş tutmadı:", error);
      toast.error("Bəyənmək baş tutmadı!");
    }
  };

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  useEffect(() => {
    if (articleContentRef.current) {
      hljs.highlightAll(); // Highlight code blocks after content is rendered
    }
  }, [articles]); // Trigger when articles change

  // Initialize Showdown Converter
  const converter = new showdown.Converter();

  return (
    <section className="p-6 h-screen overflow-auto">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2 className="text-2xl font-bold my-6">Məqalələr</h2>
      <div className="space-y-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className={`p-4 border border-gray-300 rounded relative max-w-full${
                editArticleId === article.id ? "bg-gray-100" : ""
              }`}
            >
              <h3
                onClick={() => {
                  if (editArticleId !== article.id) {
                    setSelectedArticle(
                      selectedArticle?.id === article.id ? null : article
                    );
                  }
                }}
                className="text-xl font-semibold cursor-pointer hover:text-blue-500"
              >
                {article.title}
              </h3>
              <span className="text-sm text-blue-900">
                Kateqoriya: {article.category}
              </span>
              <p className="text-sm text-gray-500 mb-9">
                Yazıldığı tarix:{" "}
                {format(
                  new Date(article.createdAt.seconds * 1000),
                  "dd/MM/yyyy"
                )}
              </p>
              {selectedArticle?.id === article.id &&
                editArticleId !== article.id && (
                  <div
                    className="mt-4 mb-8 text-gray-700"
                    ref={articleContentRef}
                    dangerouslySetInnerHTML={{
                      __html: converter.makeHtml(article.content),
                    }}
                  ></div>
                )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(article.id);
                }}
                className={`absolute top-2 right-2 ${
                  article.likes.includes(user.uid)
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="ml-1">{article.likes.length}</span>{" "}
              </button>

              {(article.userId === user.uid || isAdmin) && (
                <>
                  {editArticleId !== article.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditArticleId(article.id);
                        setEditTitle(article.title);
                        setEditContent(article.content);
                      }}
                      className="absolute bottom-2 right-14 px-3 py-1 mt-2 bg-blue-500 text-white text-sm rounded"
                    >
                      Redaktə et
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteArticle(article.id);
                    }}
                    className="absolute bottom-2 right-2 px-3 py-1 mt-2 bg-red-500 text-white text-sm rounded"
                  >
                    Sil
                  </button>

                  {editArticleId === article.id && (
                    <div className="">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => handleEditChange(e, "title")}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded"
                      />
                      <ReactQuill
                        value={editContent}
                        onChange={(content) => setEditContent(content)}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded mb-8"
                        theme="snow"
                        modules={modules}
                        formats={formats}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateArticle(article.id);
                        }}
                        className="absolute bottom-2 px-3 py-1 mt-2 bg-green-500 text-white text-sm rounded"
                      >
                        Güncəllə
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditArticleId(null);
                        }}
                        className="absolute bottom-2 left-24 mx-3 px-3 py-1 bg-gray-500 text-white text-sm rounded"
                      >
                        Ləğv et
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : user ? (
          <p>Məqalə yoxdur.</p>
        ) : (
          <p>Məqalələri görmək üçün Google hesabı ilə giriş edin.</p>
        )}
      </div>
    </section>
  );
};
