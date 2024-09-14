import { useState, useEffect } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  addDoc,
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

export const Articles = () => {
  const { user, firestore } = useAuthContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editArticleId, setEditArticleId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [categories] = useState([
    "Proqramlaşdırma",
    "Qrafik dizayn",
    "İdman",
    "Təhsil",
    "Digər",
  ]);

  const isAdmin = user && user.email === "alyvdev@gmail.com";

  const addArticle = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Məqalə əlavə etmək üçün admin olmalısınız.");
      return;
    }

    if (!title || !content || !category) {
      toast.error("Zəhmət olmasa, bütün boş xanaları doldurun!");
      return;
    }

    try {
      await addDoc(collection(firestore, "articles"), {
        title,
        content,
        category,
        userId: user.uid,
        createdAt: new Date(),
        likes: [],
      });
      setTitle("");
      setContent("");
      setCategory("");
      toast.success("Məqalə uğurla əlavə olundu!");
      fetchArticles();
    } catch (error) {
      console.error("Məqalə əlavə edilərkən xəta baş verdi: ", error);
      toast.error("Məqalə əlavə oluna bilmədi!");
    }
  };

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

  return (
    <section className="p-6 h-screen overflow-auto w-full">
      <ToastContainer position="top-right" />

      {isAdmin && (
        <div>
          <form onSubmit={addArticle} className="space-y-4 max-w-full">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Başlıq"
              />
            </div>

            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Məzmun"
              />
            </div>

            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Kateqoriya seçin</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Məqalə əlavə et
            </button>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-bold my-6">Məqalələr</h2>
      <div className="space-y-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className={`p-4 border border-gray-300 rounded relative max-w-full${
                editArticleId === article.id ? "bg-gray-100" : ""
              }`}
              onClick={() => {
                if (editArticleId !== article.id) {
                  setSelectedArticle(
                    selectedArticle?.id === article.id ? null : article
                  );
                }
              }}
            >
              <h3 className="text-xl font-semibold">{article.title}</h3>
              <span className="text-sm text-blue-600">
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
                  <p className="mt-4 mb-8 text-gray-700">{article.content}</p>
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

                  {/* Düzenleme işlemi */}
                  {editArticleId === article.id && (
                    <div className="h-96">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => handleEditChange(e, "title")}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => handleEditChange(e, "content")}
                        className="block h-[70%] w-full mt-2 p-2 border border-gray-300 rounded"
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
                          setEditArticleId(null); // İptal işlemi
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
        ) : (
          <p>Hələ məqalə yoxdu.</p>
        )}
      </div>
    </section>
  );
};
