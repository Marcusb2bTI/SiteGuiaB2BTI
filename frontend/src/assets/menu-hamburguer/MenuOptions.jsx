import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiSolidFoodMenu } from "react-icons/bi";
import {
  FaPrint,
  FaLaptop,
  FaDesktop,
  FaKeyboard,
  FaMouse,
  FaMobileAlt,
  FaFileInvoice,
  FaMoneyBillWave,
  FaUniversity,
  FaTools,
  FaCog,
  FaLock,
  FaKey,
  FaFileAlt,
  FaFolder,
  FaEnvelope,
  FaGlobe,
  FaQuestionCircle,
  FaLightbulb
} from 'react-icons/fa';

// Ajuste se o seu backend rodar em outro endereço/porta
const API_URL = 'http://localhost:3000/api';
const mapaIcones = {
  FaPrint,
  FaLaptop,
  FaDesktop,
  FaKeyboard,
  FaMouse,
  FaMobileAlt,
  FaFileInvoice,
  FaMoneyBillWave,
  FaUniversity,
  FaTools,
  FaCog,
  FaLock,
  FaKey,
  FaFileAlt,
  FaFolder,
  FaEnvelope,
  FaGlobe,
  FaQuestionCircle,
  FaLightbulb
};

function MenuOptions({ setIsOpen, isOpen }) {
  const [assuntos, setAssuntos] = useState([]);

  const closeMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    fetch(`${API_URL}/assuntos`)
      .then((res) => res.json())
      .then((data) => setAssuntos(data))
      .catch(() => setAssuntos([]));
  }, []);

  return (
    <>
      {/* fundo escuro atrás do menu */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* menu lateral */}
      <nav
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="sidebar"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          
          <div className="flex items-center gap-2">
          <BiSolidFoodMenu />
          <h3 className="text-lg font-bold">Menu</h3>
          </div>
          
          <button
            onClick={closeMenu}
            className="text-2xl leading-none text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto">
          {assuntos.map((assunto) => (
            <Link
              to={`/guia/${assunto.slug}`}
              key={assunto.id}
              onClick={closeMenu}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100"
            >
              {mapaIcones[assunto.icone]?.call(null, { className: "text-xl" })}
              <h4 className="text-sm font-medium text-gray-800">{assunto.titulo}</h4>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default MenuOptions;