import logo from '../assets/LogoB2B.png';
import { Outlet } from 'react-router-dom';
import MenuHamburguer from '../assets/menu-hamburguer/MenuHamburguer';
import MenuOptions from '../assets/menu-hamburguer/MenuOptions';
import { useState } from 'react';
import AdminLoginModal from '../components/AdminLoginModal';

function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalLogin, setModalLogin] = useState(false);

  return (
    <section className="min-h-screen bg-gray-100">
      <MenuHamburguer setIsOpen={setIsOpen} isOpen={isOpen} />
      <MenuOptions setIsOpen={setIsOpen} isOpen={isOpen} />

      <div className="max-w-5xl mx-auto">
        <header className="bg-gradient-to-r from-blue-500 to-teal-400 text-white text-center py-12 px-6 rounded-b-3xl shadow-md">
          <div className="flex justify-center mb-4">
            <a href="/">
              <img
                src={logo}
                alt="B2BTI Logo"
                className="h-40 w-auto object-contain "
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </a>
          </div>
          <h1 className="text-3xl font-bold">B2BTI - Central de Suporte</h1>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </section>
  );
}

export default HomePage;