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
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Comments } from "./Comments";
import { useLanguage } from "../providers/LanguageProvider";

// Firestore'dan makale verisini çekmek için fonksiyon
const fetchArticle = async (firestore, id) => {
  const docRef = doc(firestore, "articles", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Məqalə tapılmadı!");
  }
};

// Beğeni toggle işlemi için fonksiyon
const toggleLike = async ({ firestore, articleId, userData, likes }) => {
  const articleRef = doc(firestore, "articles", articleId);
  if (likes.includes(userData.uid)) {
    await updateDoc(articleRef, {
      likes: arrayRemove(userData.uid),
    });
  } else {
    await updateDoc(articleRef, {
      likes: arrayUnion(userData.uid),
    });
  }
};

export const ArticlesDetails = () => {
  const { id } = useParams();
  const { userData, firestore } = useAuthContext();
  const queryClient = useQueryClient();
  const { translations } = useLanguage();

  // Firestore'dan makaleyi çek
  const { data: article, isLoading } = useQuery(
    ["article", id],
    () => fetchArticle(firestore, id),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onError: (error) => toast.error(error.message),
    }
  );

  // Beğeni işlevi için mutation kullan
  const mutation = useMutation(toggleLike, {
    onSuccess: () => {
      // Cache'i güncelle
      queryClient.invalidateQueries(["article", id]);
    },
    onError: () => {
      toast.error("Bəyənmək baş tutmadı!");
    },
  });

  const handleLike = () => {
    if (!userData) {
      toast.error("Zəhmət olmasa, öncə giriş edin!");
      return;
    }
    mutation.mutate({
      firestore,
      articleId: article.id,
      userData,
      likes: article.likes,
    });
  };

  const handleShare = () => {
    const shareData = {
      title: article.title,
      text: "Buna mütləq baxmalısan!",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => {})
        .catch((error) => {
          toast.error("Paylaşım uğursuz oldu!");
          console.error("Paylaşım xətası:", error);
        });
    } else {
      navigator.clipboard.writeText(shareData.url);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center bg-gray-100">
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
        </div>
      </div>
    );
  }

  return (
    <section className=" shadow-md rounded-lg overflow-hidden mx-auto">
      <ToastContainer position="top-center" autoClose={2000} />
      {article ? (
        <div className="p-6">
          <div className="flex items-center justify-between text-gray-600 mb-4">
            <Link
              to="/articles"
              className="flex items-center transition-colors hover:text-gray-400"
            >
              <IoArrowBack className="w-6 h-6 mr-2" /> {translations.backToArticles}
            </Link>
            <button
              onClick={handleShare}
              className=""
            >
              <IoShareOutline className="w-6 h-6 text-gray-600 hover:text-gray-400 transition-colors" />
            </button>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {article.title}
            </h2>
            <p className="text-sm text-[#64ffda] mb-4">{article.category}</p>
            <div
              className="prose lg:prose-xl max-w-none" // Prose for better typography
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="flex items-center justify-between mt-6 border-t pt-4">
              <div className="flex items-center gap-4 text-gray-500">
                {userData ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike();
                    }}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {article.likes.includes(userData.uid) ? (
                      <BiSolidLike className="text-white w-6 h-6" />
                    ) : (
                      <BiLike className="w-6 h-6" />
                    )}
                    <span>{article.likes.length}</span>
                  </button>
                ) : (
                  <BiLike className="w-6 h-6 text-gray-400 cursor-not-allowed" />
                )}
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200" /> {/* Styled horizontal rule */}
          <Comments articleId={article.id} />
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600">
            {translations.articleNotFound}
          </h2>
        </div>
      )}
    </section>
  );
};
