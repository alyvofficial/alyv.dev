import { useState, useRef, useMemo } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import { collection, addDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "jodit";
import JoditEditor from "jodit-react";
import { AddProject } from "./AddProject";

export const AddArticleForm = () => {
  const { userData, firestore } = useAuthContext();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const editorRef = useRef(null);
  const [content, setContent] = useState("");

  const [categories] = useState([
    "Proqramlaşdırma",
    "Qrafik dizayn",
    "İdman",
    "Təhsil",
    "Digər",
  ]);

  const isAdmin = userData && userData.email === "alyvdev@gmail.com";

  const config = useMemo(() => {
    return {
      readonly: false,
      height: "500px",
      uploader: { insertImageAsBase64URI: true },
    };
  }, []);

  const addArticle = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Məqalə əlavə etmək üçün admin olmalısınız.");
      return;
    }

    const content = editorRef.current.value;

    if (!title || !content || !category) {
      toast.error("Zəhmət olmasa, bütün boş xanaları doldurun!");
      return;
    }

    try {
      const createdAt = new Date();

      // Firestore'da makale ekle
      const docRef = await addDoc(collection(firestore, "articles"), {
        title,
        content,
        category,
        userId: userData.uid,
        createdAt,
        likes: [],
      });

      console.log("Məqalə əlavə olundu, ID:", docRef.id);
      setTitle("");
      setCategory("");
      setContent("");
      toast.success("Məqalə uğurla əlavə olundu!");
    } catch (error) {
      console.error("Məqalə əlavə edilərkən xəta baş verdi: ", error);
      toast.error("Məqalə əlavə oluna bilmədi!");
    }
  };

  return (
    <section className="p-5 min-h-screen overflow-y-auto">
      <ToastContainer position="top-center" autoClose={2000} />

      {isAdmin ? (
        <div className="h-full mb-3">
          <form
            onSubmit={addArticle}
            className="space-y-4 h-full max-w-full border-black"
          >
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
              <JoditEditor
                ref={editorRef}
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
                onChange={(newContent) => {
                  setContent(newContent);
                }}
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Əlavə et
            </button>
          </form>
        </div>
      ) : (
        <p>Yalnız adminlər məqalə əlavə edə bilər.</p>
      )}
      <hr />
      <AddProject />
    </section>
  );
};
