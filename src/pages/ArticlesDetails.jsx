import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { IoShareOutline, IoArrowBack } from "react-icons/io5";
import { NavLink } from "react-router-dom";

export const ArticlesDetails = () => {
  const { id } = useParams();
  const { user, firestore } = useAuthContext();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = async () => {
    try {
      const cachedArticle = localStorage.getItem(`article_${id}`);
      if (cachedArticle) {
        // If article is found in local storage, use it
        setArticle(JSON.parse(cachedArticle));
      } else {
        // If not found, fetch from Firestore
        const docRef = doc(firestore, "articles", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedArticle = { id: docSnap.id, ...docSnap.data() };
          setArticle(fetchedArticle);
          localStorage.setItem(`article_${id}`, JSON.stringify(fetchedArticle)); // Cache it
        } else {
          toast.error("Məqalə tapılmadı!");
        }
      }
    } catch (error) {
      toast.error("Məqaləyi yükləyə bilmədik!");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Zəhmət olmasa, öncə giriş edin!");
      return;
    }

    try {
      const articleRef = doc(firestore, "articles", article.id);

      if (article.likes.includes(user.uid)) {
        await updateDoc(articleRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(articleRef, {
          likes: arrayUnion(user.uid),
        });
      }

      // Fetch updated article and update localStorage
      const docSnap = await getDoc(articleRef);
      if (docSnap.exists()) {
        const updatedArticle = { id: docSnap.id, ...docSnap.data() };
        setArticle(updatedArticle);
        localStorage.setItem(
          `article_${article.id}`,
          JSON.stringify(updatedArticle)
        );
      }
    } catch (error) {
      console.error("Bəyənmək baş tutmadı:", error);
      toast.error("Bəyənmək baş tutmadı!");
    }
  };

  const handleShare = () => {
    const shareData = {
      title: article.title,
      text: "Bu məqaləyə baxın!",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => {
          toast.success("Məqalə paylaşıldı!");
        })
        .catch((error) => {
          toast.error("Paylaşım uğursuz oldu!");
          console.error("Paylaşım xətası:", error);
        });
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Məqalə linki kopyalandı!");
    }
  };

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-500">Yüklənir...</div>;
  }

  return (
    <section className="min-h-screen">
      <ToastContainer position="top-center" autoClose={2000} />
      {!user ? (
        <p>Məqalələri görmək üçün zəhmət olmasa giriş edin.</p>
      ) : article ? (
        <div className="p-4">
          <div className="w-full py-4 flex items-center justify-between text-gray-500">
            <div className="flex items-center">
              <NavLink to={"/articles"}>
                <IoArrowBack className="w-5 h-5 hover:text-black" />
              </NavLink>
            </div>
            {/* Paylaş düyməsi */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-black justify-self-start content-start"
            >
              <IoShareOutline className="h-6 w-6" />
            </button>
          </div>
          <div className="min-h-screen">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">{article.title}</h2>
              <div className="flex">
                {/* Beğen butonu */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(article.id);
                  }}
                  className=""
                >
                  {article.likes.includes(user.uid) ? (
                    <BiSolidLike className="text-blue-500 h-6 w-6" />
                  ) : (
                    <BiLike className="text-gray-400 h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Kateqoriya: {article.category}
            </p>
            <div
              className="mt-2"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            <div className="flex items-center mt-4"></div>
          </div>
        </div>
      ) : (
        <p>Məqalə tapılmadı.</p>
      )}
    </section>
  );
};
