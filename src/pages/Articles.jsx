import { useState, useEffect, useRef, useMemo } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import hljs from "highlight.js";
import "./Highlight.css";
import "jodit";
import JoditEditor from "jodit-react";

export const Articles = () => {
  const editorRef = useRef(null);
  const { user, firestore } = useAuthContext();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editArticleId, setEditArticleId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const config = useMemo(() => {
    return {
      readonly: false,
      height: "500px",
      uploader: { insertImageAsBase64URI: true },
    };
  }, []);
  const [categories] = useState([
    "Proqramlaşdırma",
    "Qrafik dizayn",
    "İdman",
    "Təhsil",
    "Digər",
  ]);

  const isAdmin = user && user.email === "alyvdev@gmail.com";
  const articleContentRef = useRef(null);

  const fetchArticlesFromFirestore = () => {
    setLoading(true);

    // İlk olarak yerel depolamayı kontrol ediyoruz
    const localArticles = JSON.parse(localStorage.getItem("articles"));
    if (localArticles) {
      // Eğer yerel depolamada makaleler varsa, bunları hemen state'e koyuyoruz
      setArticles(localArticles);
      setLoading(false);
    }

    // Ardından Firebase'den gerçek zamanlı olarak makaleleri çekmeye devam ediyoruz
    const articlesRef = collection(firestore, "articles");

    const unsubscribe = onSnapshot(articlesRef, (querySnapshot) => {
      const articlesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Firebase'den gelen veriler yerel depolamaya kaydediliyor ve state güncelleniyor
      setArticles(articlesList);
      localStorage.setItem("articles", JSON.stringify(articlesList)); // LocalStorage'a yazılıyor
      setLoading(false);
    });

    return () => unsubscribe(); // Bileşen unmount olduğunda dinlemeyi durduruyoruz
  };

  const deleteArticle = async (id) => {
    const articleToDelete = articles.find((article) => article.id === id);
    if (articleToDelete.userId === user.uid || isAdmin) {
      try {
        await deleteDoc(doc(firestore, "articles", id));
        toast.success("Məqalə silindi!");
        fetchArticlesFromFirestore(); // Veri silindiği için yeniden yükle
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
      setEditContent(e);
    }
  };

  const updateArticle = async (id) => {
    try {
      const articleRef = doc(firestore, "articles", id);

      // Access the editor's value using the ref
      const updatedContent = editorRef.current.value;

      await updateDoc(articleRef, {
        title: editTitle,
        content: updatedContent, // Set the updated content from the editor
        updatedAt: new Date(),
      });
      toast.success("Məqalə güncəlləndi!");
      setEditArticleId(null);
      fetchArticlesFromFirestore(); // Fetch updated articles from Firestore
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

      fetchArticlesFromFirestore();
    } catch (error) {
      console.error("Bəyənmək baş tutmadı:", error);
      toast.error("Bəyənmək baş tutmadı!");
    }
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = fetchArticlesFromFirestore(); // Verileri gerçek zamanlı dinle
      return unsubscribe; // Temizlik işlemi (unsubscribe)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  useEffect(() => {
    if (articleContentRef.current) {
      hljs.highlightAll();
    }
  }, [articles]);

  // Filter and sort the articles
  const filteredAndSortedArticles = articles
    .filter((article) => {
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

  return (
    <section className="w-screen p-5 flex flex-col  min-h-screen overflow-y-auto">
      {/* Toast bildirimlerini göstermek için ToastContainer */}
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Yüklenme durumu */}
      {loading && <div className="text-center text-gray-500">Yüklənir...</div>}

      {/* Arama ve filtreleme seçeneklerini içeren bölüm */}
      <div className="flex sm:flex-col sm:items-start items-center gap-3 mb-4">
        {/* Arama kutusu */}
        <input
          type="text"
          placeholder="Axtarışa başlayın..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 h-auto rounded w-48 focus:outline-none"
        />

        {/* Sıralama ve kategori seçimi */}
        <div className="w-auto flex">
          <label htmlFor="sortOrder" className=""></label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 mr-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="newest">Yenilər</option>
            <option value="oldest">Köhnələr</option>
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
          </select>

          <label htmlFor="category" className=""></label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="all">Hamısı</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Makale kartlarının listelendiği bölüm */}
      <div className="gap-2 flex flex-col">
        {filteredAndSortedArticles.length > 0 ? (
          filteredAndSortedArticles.map((article) => (
            <div
              key={article.id}
              className={`p-2 border border-gray-300 rounded relative w-full${
                editArticleId === article.id ? "bg-gray-100" : ""
              }`}
            >
              {/* Makale başlığı */}
              <h3
                onClick={() => {
                  if (editArticleId !== article.id) {
                    setSelectedArticle(
                      selectedArticle?.id === article.id ? null : article
                    );
                  }
                }}
                className="text-lg sm:mr-5 lg:mr-0 font-semibold cursor-pointer hover:text-blue-500"
              >
                {article.title}
              </h3>

              {/* Makale kategorisi */}
              <span className="text-sm text-blue-900">
                Kateqoriya: {article.category}
              </span>

              {/* Makale yazıldığı tarih */}
              <p className="text-xs text-gray-500 mb-1">
                Yazıldığı tarix:{" "}
                {format(
                  new Date(article.createdAt.seconds * 1000),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>

              {/* Makale içeriği (başlık tıklanmışsa gösterilir) */}
              {selectedArticle?.id === article.id &&
                editArticleId !== article.id && (
                  <div className="w-full max-w-full overflow-hidden break-words sm:p-2 bg-gray-50 mb-1">
                    <div
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    ></div>
                  </div>
                )}

              {/* Beğen butonu */}
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

              {/* Makale düzenleme ve silme butonları (kullanıcı yetkiliyse gösterilir) */}
              {(article.userId === user.uid || isAdmin) && (
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
                        className=" px-3 py-1 bg-blue-500 text-white text-sm rounded"
                      >
                        Redaktə et
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteArticle(article.id);
                        }}
                        className=" px-3 py-1 bg-red-500 text-white text-sm rounded"
                      >
                        Sil
                      </button>
                    </>
                  )}

                  {/* Makale düzenleme formu */}
                  {editArticleId === article.id && (
                    <div className="w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => handleEditChange(e, "title")}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded"
                      />
                      <JoditEditor
                        ref={editorRef}
                        value={editContent}
                        config={config}
                        onBlur={(newContent) => handleEditChange(newContent)}
                        onChange={(newContent) => {
                          handleEditChange(newContent);
                        }}
                        className="w-full"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateArticle(article.id);
                        }}
                        className="px-3 py-1 mt-2 bg-green-500 text-white text-sm rounded"
                      >
                        Güncəllə
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditArticleId(null);
                        }}
                        className=" mx-3 px-3 py-1 bg-gray-500 text-white text-sm rounded"
                      >
                        Ləğv et
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : user ? (
          // Kullanıcı giriş yapmışsa ancak makale yoksa
          <p>Məqalə yoxdur.</p>
        ) : (
          // Kullanıcı giriş yapmamışsa
          <p>Məqalələri görmək üçün zəhmət olmasa giriş edin.</p>
        )}
      </div>
    </section>
  );
};
