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
import { useQuery, useMutation, useQueryClient } from "react-query";
import { FaComments } from "react-icons/fa";
import { Comments } from "./Comments";

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
const toggleLike = async ({ firestore, articleId, user, likes }) => {
  const articleRef = doc(firestore, "articles", articleId);
  if (likes.includes(user.uid)) {
    await updateDoc(articleRef, {
      likes: arrayRemove(user.uid),
    });
  } else {
    await updateDoc(articleRef, {
      likes: arrayUnion(user.uid),
    });
  }
};


export const ArticlesDetails = () => {
  const { id } = useParams();
  const { user, firestore } = useAuthContext();
  const queryClient = useQueryClient();

  // Firestore'dan makaleyi çek
  const { data: article, isLoading } = useQuery(
    ["article", id],
    () => fetchArticle(firestore, id),
    {
      staleTime: 60000, // 1 dakika cache
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
    if (!user) {
      toast.error("Zəhmət olmasa, öncə giriş edin!");
      return;
    }
    mutation.mutate({
      firestore,
      articleId: article.id,
      user,
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
    <section className="">
      <ToastContainer position="top-center" autoClose={2000} />
      {!user ? (
        <div className="p-4 flex justify-center items-center h-[85vh] w-full">
          <div className="bg-zinc-100 p-9 rounded-lg shadow-lg flex items-center flex-col gap-2">
            <p className="text-lg text-center">
              Məqalələri oxumaq üçün zəhmət olmasa giriş edin.
            </p>
            <NavLink
              to="/auth/login"
              className="bg-black text-white py-2 px-4 rounded-lg"
            >
              Daxil ol
            </NavLink>
          </div>
        </div>
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
              <div className="flex gap-2 text-blue-500">
                {/* Beğen butonu */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                >
                  {article.likes.includes(user.uid) ? (
                    <BiSolidLike className="text-blue-500 h-6 w-6" />
                  ) : (
                    <BiLike className="text-gray-400 h-6 w-6" />
                  )}
                  <span className="ml-1">{article.likes.length}</span>
                </button>
                <a href="#comments">
                  <FaComments className="h-6 w-6" />
                </a>
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
          <hr />
          <Comments articleId={article.id} />

        </div>
      ) : (
        <div className="p-4 flex justify-center items-center h-[85vh] w-full">
          <div className="bg-zinc-100 p-9 rounded-lg shadow-lg flex items-center flex-col gap-2">
            <p className="text-lg text-center">
              Məqalələri oxumaq üçün zəhmət olmasa giriş edin.
            </p>
            <NavLink
              to="/auth/login"
              className="bg-black text-white py-2 px-4 rounded-lg"
            >
              Daxil ol
            </NavLink>
          </div>
        </div>
      )}
    </section>
  );
};
