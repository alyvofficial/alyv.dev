import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useAuthContext } from "../providers/AuthProvider";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Vacancies = () => {
  const { firestore } = useAuthContext();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "vacancies"));
        const vacanciesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVacancies(vacanciesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vacancies:", error);
        toast.error("Error fetching vacancies: " + error.message);
      }
    };

    fetchVacancies();
  }, [firestore]);

  if (loading) {
    return <div className="text-white text-center">Loading vacancies...</div>;
  }

return (
    <section className="w-full mx-auto my-4 p-5">
        <ToastContainer position="top-center" autoClose={2000} />
        <h1 className="text-2xl text-white text-center font-semibold mb-6">Vakansiyalar</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacancies.length > 0 ? (
                vacancies.map((vacancy) => (
                    <div
                        key={vacancy.id}
                        className="p-6 bg-[#2D2D2D] text-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                        <h2 className="text-xl font-bold mb-2">{vacancy.title}</h2>
                        <p className="text-gray-400 mb-2">{vacancy.company}</p>
                        <p className="text-white mb-4" dangerouslySetInnerHTML={{ __html: vacancy.description }}></p>
                        <p className="text-sm text-gray-400 mb-2">
                            Maaş: {vacancy.salary ? `${vacancy.salary}` : "Razılaşma yolu ilə"}
                        </p>
                        <p className="text-sm text-gray-400 mb-2">
                            İş Tipi: {vacancy.jobType}
                        </p>
                        <p className="text-sm text-gray-400 mb-2">
                            Ərazi: {vacancy.location}
                        </p>
                        <p className="text-sm text-gray-400 mb-2">
                            Paylaşılma Tarixi: {format(new Date(vacancy.postingDate.seconds * 1000), "dd/MM/yyyy")}
                        </p>
                        <a
                            href={`mailto:${vacancy.emailOrLink}`}
                            className="inline-block px-4 py-2 mt-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-300"
                        >
                            Email Gönder
                        </a>
                    </div>
                ))
            ) : (
                <p className="text-white text-center col-span-3">Hələ ki, vakansiyalar mövcud deyil.</p>
            )}
        </div>
    </section>
);
};
