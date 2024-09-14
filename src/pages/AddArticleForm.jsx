import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  addDoc,
} from "firebase/firestore";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




export const AddArticleForm = () => {
    const { user, firestore } = useAuthContext();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");

    const [categories] = useState([
      "Proqramlaşdırma",
      "Qrafik dizayn",
      "İdman",
      "Təhsil",
      "Digər",
    ]);
    const modules = {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", {color: []}, "image"],
        [{ "code-block": true }],
        ["clean"], [{ font: [] }]
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
      "font"
    ];

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
    } catch (error) {
      console.error("Məqalə əlavə edilərkən xəta baş verdi: ", error);
      toast.error("Məqalə əlavə oluna bilmədi!");
    }
  };
  return (
    <section className="p-5">
      <ToastContainer position="top-center"  autoClose={2000}/>

      {isAdmin && (
        <div className="h-full">
          <form onSubmit={addArticle} className="space-y-4 h-full max-w-full ">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Başlıq"
              />
            </div>

            <div >
              <ReactQuill
                value={content}
                onChange={setContent}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Məzmun"
                theme="snow"
                modules={modules}
                formats={formats}
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
              Əlavə et
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
