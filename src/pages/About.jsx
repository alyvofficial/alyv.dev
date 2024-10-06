import { useRef } from 'react';
import emailjs from '@emailjs/browser';
import { useAuthContext } from "../providers/AuthProvider";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGithub, FaInstagram, FaLinkedin, FaBehance } from 'react-icons/fa';

export const About = () => {
  const form = useRef();
  const { user } = useAuthContext();

  const sendEmail = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Mesaj göndərmək üçün giriş etməlisiniz!');
      return; // Prevent form submission
    }
    emailjs
      .sendForm(
        'service_st1bofo',
        'template_aratdro',
        form.current,
        '_tk9jHtYR4NQ0iLsB',
      )
      .then(
        () => {
          form.current.reset();
          toast.success('Mesaj uğurla göndərildi!');
        },
        (error) => {
          console.log('FAILED...', error.text);
          toast.error('Mesaj göndərilmədi :(');
        }
      );
  };
  return (
    <section className="w-full bg-black text-white">
      <div className="px-4 py-4">
        <div className="flex flex-col sm:flex-col lg:flex-row gap-8">
          {/* Sol Bölüm */}
          <div id='contact' className="bg-[#232323] sm:p-4 lg:p-5 rounded-md flex-1">
            <h2 className="text-xl font-bold text-[#64ffda] mb-4">ƏLAQƏ</h2>
            <div className="mb-4">
              <p className="text-white">Mobil nömrə</p>
              <a
                href="tel:+994502047722"
                className="text-gray-400 hover:text-white"
              >
                +994502047722
              </a>
            </div>
            <div className="mb-4">
              <p className="text-white">Email</p>
              <a
                href="mailto:aliyev@alyv.dev"
                className="text-gray-400 hover:text-white"
              >
                aliyev@alyv.dev
              </a>
            </div>
            <div className="mb-4">
              <p className="text-white">Vebsayt</p>
              <a
                href="https://alyvofficial.net"
                className="text-gray-400 hover:text-white"
              >
                https://alyvofficial.net
              </a>
              <br />
              <a
                href="https://alyv.dev"
                className="text-gray-400 hover:text-white"
              >
                https://alyv.dev
              </a>
            </div>
             {/* Form */}
             <form ref={form} onSubmit={sendEmail} className="bg-[#1b1b1b] rounded-md sm:p-4 lg:p-6">
              <div className="mb-4">
                <label htmlFor="name" className="block text-white mb-2">
                  Ad
                </label>
                <input
                  type="text"
                  id="name"
                  name="user_name"
                  className="w-full p-2 rounded-md bg-[#333] text-white focus:outline-none"
                  required
                  value={user?.displayName}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="user_email"
                  className="w-full p-2 rounded-md bg-[#333] text-white focus:outline-none" 
                  required
                  value={user?.email}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-white mb-2">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder='Mesajınızı daxil edin...'
                  className="w-full p-2 rounded-md bg-[#333] text-white"
                  rows="4"
                  required
                ></textarea>
              </div>
              <input
                className="bg-[#64ffda] text-black px-4 py-2 rounded-md hover:bg-[#52e0c4] border-none cursor-pointer outline-none"
                type="submit"
                value="Göndər"
              />
            </form>
            <ToastContainer position="top-center" autoClose={2000} />

            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#64ffda] mb-4">
                SERTİFİKATLAR
              </h2>
              <div className="mb-2">
                <p>YUP Technology</p>
                <p className="text-sm">Front-end website development</p>
                <p className="text-base">2023</p>
              </div>
              <div className="mb-2">
                <p>Robotex Azerbaijan - Eurasia</p>
                <p className="text-sm">Software Technology - 3rd place</p>
                <p className="text-base">2024</p>
              </div>
              <div className="mb-2">
                <p>Robotex Turkey - Antalya</p>
                <p className="text-sm">Health sciences and tech. - 2nd place</p>
                <p className="text-base">2024</p>
              </div>
              <div className="mb-2">
                <p>Fibonacci International Robot O.</p>
                <p className="text-sm">Health sciences and tech. - 2nd place</p>
                <p className="text-base">2024</p>
              </div>
              <div className="mb-2">
                <p>Viveka Company Creation Program</p>
                <p className="text-sm">Certificate of completion</p>
                <p className="text-base">2024</p>
              </div>
              <div>
                <p>CELT Colleges</p>
                <p className="text-sm">English B2 level</p>
              </div>
            </div>
              <div className="mt-8">
              <h2 className="text-xl font-bold text-[#64ffda] mb-4">SOSİAL ŞƏBƏKƏLƏR</h2>
              <div className="flex space-x-4">
                <a href="https://github.com/alyvofficial" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#64ffda]">
                <FaGithub size={20} />
                </a>
                <a href="https://instagram.com/alyvdev" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#64ffda]">
                <FaInstagram size={20} />
                </a>
                <a href="https://behance.net/alyvdesign" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#64ffda]">
                <FaBehance size={20} />
                </a>
                <a href="https://linkedin.com/in/alyvofficial" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#64ffda]">
                <FaLinkedin size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Orta Bölüm */}
          <div className="bg-[#232323] sm:p-4 lg:p-5 rounded-md flex-1">
            <h2 className="text-xl font-bold text-[#64ffda] mb-4">
              BACARIQLAR
            </h2>
            <div>
              <p className="sm:text-base lg:text-lg font-bold text-[#64ffda] mt-6 mb-3">
                Front-end
              </p>
              <div className="mb-2">
                <p className="text-white">HTML / CSS</p>
                <div className="h-2 bg-[#969696] w-full rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">JavaScript</p>
                <div className="h-2 bg-[#969696] w-3/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">React JS</p>
                <div className="h-2 bg-[#969696] w-1/2 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">Bootstrap</p>
                <div className="h-2 bg-[#969696] w-3/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">jQuery</p>
                <div className="h-2 bg-[#969696] w-3/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">Tailwind CSS</p>
                <div className="h-2 bg-[#969696] w-[85%] rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
            </div>
            <h2 className="sm:text-base lg:text-lg font-bold text-[#64ffda] mt-6 mb-3">
              Dizayn
            </h2>
            <div className="mb-2">
              <p className="text-white">Adobe Photoshop</p>
              <div className="h-2 bg-[#969696] w-full rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
            </div>
            <div className="mb-2">
              <p className="text-white">Adobe Illustrator</p>
              <div className="h-2 bg-[#969696] w-3/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
            </div>
            <div className="mb-2">
              <p className="text-white">Adobe InDesign</p>
              <div className="h-2 bg-[#969696] w-1/2 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
            </div>
            <div className="mb-2">
              <p className="text-white">After Effects</p>
              <div className="h-2 bg-[#969696] w-3/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
            </div>
            <div className="mb-2">
              <p className="text-white">Figma</p>
              <div className="h-2 bg-[#969696] w-full rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
            </div>
            <div className="mb-2">
              <p className="text-white">Blender</p>
              <div className="h-2 bg-[#969696] w-3/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
            </div>

            <div>
              <p className="sm:text-base lg:text-lg font-bold text-[#64ffda] mt-6 mb-3">
                Digər
              </p>
              <div className="mb-2">
                <p className="text-white">Helpdesk</p>
                <div className="h-2 bg-[#969696] w-full rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">Python</p>
                <div className="h-2 bg-[#969696] w-1/2 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">Pandas</p>
                <div className="h-2 bg-[#969696] w-1/2 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">BeautifulSoup</p>
                <div className="h-2 bg-[#969696] w-1/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">Office apps</p>
                <div className="h-2 bg-[#969696] w-full rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">Firebase</p>
                <div className="h-2 bg-[#969696] w-[85%] rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
            </div>
          </div>

          {/* Sağ Bölüm */}
          <div className="bg-[#232323] sm:p-4 lg:p-5 rounded-md flex-1">
            <div>
              <h2 className="text-xl font-bold text-[#64ffda] mb-3">TƏCRÜBƏ</h2>
              <div className="mb-2">
                <p>2024</p>
                <div>
                  <p>Robotex Azerbaijan - Eurasia championship</p>
                  <p className="text-sm">
                    Robotex Turkey - Antalya championship
                  </p>
                  <p className="text-sm">
                    Front-end development və UI dizaynla bağlı lahiyə
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p>2024</p>
                <div>
                  <p>Google Developer Group - Build with AI</p>
                  <p className="text-sm">Gemini API ilə chatbot lahiyəsi</p>
                </div>
              </div>
              <div className="mb-2">
                <p>2024</p>
                <div>
                  <p>Google Developer Group - Build web with Firebase</p>
                  <p className="text-sm">
                    Google Firebase ilə vebsayt lahiyəsi
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p>2024</p>
                <div>
                  <p>Viveka Company Creation Program</p>
                  <p className="text-sm">Viveka startup lahiyəsi</p>
                </div>
              </div>
              <div className="mb-2">
                <p>2023</p>
                <div>
                  <p>Mix Point Cafe</p>
                  <p className="text-sm">Motion dizaynla bağlı 2 lahiyə</p>
                </div>
              </div>
              <div className="mb-2">
                <p>2023</p>
                <div>
                  <p>Digital Cast</p>
                  <p className="text-sm">
                    YouTube və Instagram üçün &quot;intro&quot;
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p>2023</p>
                <div>
                  <p>Qarabag</p>
                  <p className="text-sm">Qrafik dizaynla bağlı 3 lahiyə</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#64ffda] mb-4">
                DİL BİLİYİ
              </h2>
              <div className="mb-2">
                <p className="text-white">Azərbaycan dili</p>
                <div className="h-2 bg-[#969696] w-full rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div className="mb-2">
                <p className="text-white">İngilis dili (B2)</p>
                <div className="h-2 bg-[#969696] w-3/4 rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
              <div>
                <p className="text-white">Rus dili (A1)</p>
                <div className="h-2 bg-[#969696] w-[10%] rounded-full mt-1 hover:bg-[#64ffda] transition"></div>
              </div>
            </div>
            <div id='about' className="mt-8">
              <h2 className="text-xl font-bold text-[#64ffda] mb-4">
                HAQQIMDA
              </h2>
              <p>
                2020-ci ildən frilans olaraq qrafik dizayn və UI dizaynla
                məşğulam, 2023-cü ilin Martından isə Front-end vebsayt
                proqramlaşdırmağ; öyrənirəm. Komanda ilə düzgün işləmək, işləri
                vaxtında çatdırmağa önəm verən biriyəm. Daima araşdırmağa və
                yenilikləri öyrənməyə çalışıram. Çəvik iş görməyi, ətrafımdakı
                insanlarla öyrəndiklərim və bildiklərimi paylaşmağı sevirəm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
