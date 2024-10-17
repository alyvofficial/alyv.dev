import { useState, useEffect } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getCountFromServer,
  updateDoc,
} from "firebase/firestore";
import { useQuery } from "react-query";
import { useLanguage } from "../providers/LanguageProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCartPlus } from "react-icons/fa6";
import { MdDelete, MdEdit } from "react-icons/md";
import { ref, deleteObject } from "firebase/storage";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";

export const Shop = () => {
  const { firestore, userData, myStorage } = useAuthContext();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { translations } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newDescription, setNewDescription] = useState("");

  const fetchProducts = async (
    perPage,
    startAfterDoc = null,
    endBeforeDoc = null
  ) => {
    const collectionRef = collection(firestore, "products");

    let productsQuery = query(
      collectionRef,
      orderBy("dateAdded", "desc"),
      limit(perPage)
    );

    if (startAfterDoc) {
      productsQuery = query(
        collectionRef,
        orderBy("dateAdded", "desc"),
        startAfter(startAfterDoc),
        limit(perPage)
      );
    } else if (endBeforeDoc) {
      productsQuery = query(
        collectionRef,
        orderBy("dateAdded", "desc"),
        endBefore(endBeforeDoc),
        limit(perPage)
      );
    }

    const querySnapshot = await getDocs(productsQuery);
    const fetchedProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setFirstVisible(querySnapshot.docs[0]);

    return fetchedProducts;
  };

  const fetchTotalPages = async () => {
    const collectionRef = collection(firestore, "products");
    const count = await getCountFromServer(collectionRef);
    const totalProducts = count.data().count;
    const calculatedTotalPages = Math.ceil(totalProducts / productsPerPage);
    setTotalPages(calculatedTotalPages);
  };

  const { data: products, isLoading } = useQuery(
    ["products", currentPage],
    () =>
      fetchProducts(
        productsPerPage,
        currentPage > 1 ? lastVisible : null,
        currentPage < totalPages ? firstVisible : null
      ),
    {
      enabled: !!currentPage, // sadece projectType ve currentPage dolu olduğunda istek yap
      staleTime: Infinity, // Veriyi süresiz olarak önbellekte tut
      refetchOnMount: false, // Bileşen montaj edildiğinde yeniden istek yapma
      refetchOnWindowFocus: false, // Pencere odağa geldiğinde yeniden istek yapma
      refetchOnReconnect: false, // Bağlantı yeniden kurulduğunda istek yapma
      cacheTime: Infinity, // Veriyi süresiz olarak önbellekte tut
      keepPreviousData: true, // Yeni veri gelene kadar önceki veriyi göster
    }
  );

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };

  const addToCart = (product) => {
    const quantityToAdd = quantities[product.id] || 1;
    setSelectedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((p) => p.id === product.id);
      if (existingProduct) {
        return prevProducts.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + quantityToAdd }
            : p
        );
      } else {
        return [...prevProducts, { ...product, quantity: quantityToAdd }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };

  const openProductModal = (product) => {
    setSelectedProductDetails(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProductDetails(null);
  };

  const createWhatsAppLink = () => {
    const productDetails = selectedProducts
      .map(
        (product) =>
          `${product.name} (${product.quantity}) - ${
            product.price * product.quantity
          }₼`
      )
      .join("\n");
    const message = `Salam, hər vaxtınız xeyir. Mən bu məhsulları almaq istəyirdim:\n${productDetails}\nCəmi: ${selectedProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    )}₼`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/994502047722?text=${encodedMessage}`;
  };

  const handleDeleteProduct = async (product) => {
    if (userData && userData.email === "alyvdev@gmail.com") {
      try {
        const productDocRef = doc(firestore, "products", product.id);
        await deleteDoc(productDocRef);

        const imageRef = ref(myStorage, product.imageUrl);
        await deleteObject(imageRef);

        toast.success("Məhsul uğurla silindi");
        refetch(); // react-query'nin refetch fonksiyonunu kullanarak verileri güncelle
      } catch (error) {
        console.error("Məhsul silinərkən xəta baş verdi:", error);
        toast.error("Məhsul silinərkən xəta baş verdi");
      }
    } else {
      toast.error("Məhsulu silməyə icazəniz yoxdur!");
    }
  };

  const handleUpdateProduct = async (product) => {
    if (userData && userData.email === "alyvdev@gmail.com") {
      try {
        const productDocRef = doc(firestore, "products", product.id);
        await updateDoc(productDocRef, {
          name: newName,
          price: newPrice,
          description: newDescription,
        });
        toast.success("Məhsul uğurla güncəlləndi");
        setEditingProduct(null);
        refetch();
      } catch (error) {
        console.error("Məhsul güncəllənərkən xəta baş verdi:", error);
        toast.error("Məhsul güncəllənərkən xəta baş verdi");
      }
    } else {
      toast.error("Məhsulu güncəlləməyə icazəniz yoxdur!");
    }
  };

  useEffect(() => {
    fetchTotalPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePagination = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const { refetch } = useQuery(
    ["products", currentPage],
    () =>
      fetchProducts(
        productsPerPage,
        currentPage > 1 ? lastVisible : null,
        currentPage > 1 ? firstVisible : null
      ),
    {
      keepPreviousData: true,
      enabled: !!currentPage,
      staleTime: Infinity,
    }
  );

  return (
    <section className="w-full mx-auto p-4 bg-black min-h-screen">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="mb-8 bg-[#232323] sm:w-full lg:w-1/3 p-4 rounded-lg">
        <h2 className="text-white text-xl mb-4">{translations.yourCart}</h2>
        {selectedProducts.length === 0 ? (
          <p className="text-gray-400">{translations.NoProductsInCart}</p>
        ) : (
          <div className="list-decimal text-white">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between"
              >
                <p className="flex justify-between items-center">
                  <span className="text-white">
                    {product.name} ({product.quantity}) -{" "}
                    {product.price * product.quantity}₼
                  </span>
                </p>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-red-500"
                >
                  <MdDelete size={25} />
                </button>
              </div>
            ))}
            <div className="mt-4 text-white text-lg">
              {translations.totalPrice}:{" "}
              {selectedProducts.reduce(
                (total, product) => total + product.price * product.quantity,
                0
              )}
              ₼
            </div>
          </div>
        )}

        {/* Checkout Button */}
        {selectedProducts.length > 0 && (
          <a
            href={createWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#383838] mt-4 block p-2 text-white text-center rounded"
          >
            {translations.checkoutWithWhatsApp}
          </a>
        )}
      </div>

      {/* Product List */}
      <div className="flex flex-wrap items-center gap-6">
        {isLoading ? (
          <p className="text-white">{translations.loadingProducts}</p>
        ) : products && products.length === 0 ? (
          <p className="text-gray-400">{translations.NoProductsAvailable}</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-lg bg-[#232323] md:w-[48%] lg:w-[32%] bg-cover bg-center relative"
            >
              {editingProduct && editingProduct.id === product.id && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="p-4 rounded-lg bg-[#232323]">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ad"
                      className="p-2 rounded mb-2 w-full bg-[#383838]"
                    />
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                      placeholder="Qiymət"
                      className="p-2 rounded mb-2 w-full bg-[#383838]"
                    />
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Təsvir"
                      className="w-full p-2 rounded mb-2 bg-[#383838]"
                    />
                    <button
                      onClick={() => handleUpdateProduct(product)}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Yenilə
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="ml-2 px-4 py-2 bg-red-500 rounded"
                    >
                      Ləğv et
                    </button>
                  </div>
                </div>
              )}

              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full object-cover mb-4 aspect-video rounded-lg cursor-pointer hover:brightness-75 transition-all"
                onClick={() => openProductModal(product)}
              />
              <h2 className="text-white text-lg">{product.name}</h2>
              <p className="text-gray-400 mb-2">{product.price}₼</p>

              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min="1"
                  value={quantities[product.id] || 1}
                  onChange={(e) =>
                    handleQuantityChange(product.id, parseInt(e.target.value))
                  }
                  className="w-16 p-1 rounded bg-[#383838] text-white"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="text-white rounded"
                >
                  <FaCartPlus size={25} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-4">
                {userData && userData.email === "alyvdev@gmail.com" && (
                  <>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setNewName(product.name);
                        setNewPrice(product.price);
                        setNewDescription(product.description);
                      }}
                      className="text-xl text-white"
                    >
                      <MdEdit size={25} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="text-xl text-red-600"
                    >
                      <MdDelete size={25} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
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

      {/* Modal for product details */}
      {isModalOpen && selectedProductDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto bg-black/80">
          <div className="bg-[#232323] py-8 px-4 rounded-lg w-[90%] max-w-md">
            <h2 className="text-white text-2xl mb-2">
              {selectedProductDetails.name}
            </h2>
            <div className="overflow-y-auto max-h-64">
              <p className="text-gray-400 mb-2 h-1/2">
                {selectedProductDetails.description}
              </p>
            </div>

            <p className="text-gray-500 mb-2">
              {new Date(
                selectedProductDetails.dateAdded.seconds * 1000
              ).toLocaleDateString()}
            </p>
            <button
              onClick={closeProductModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              {translations.close}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
