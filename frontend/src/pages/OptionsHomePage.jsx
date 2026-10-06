import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLoginModal from '../components/AdminLoginModal';

// Ajuste se o seu backend rodar em outro endereço/porta
const API_URL = 'http://localhost:3000/api';

function OptionsHomePage() {
  const [assuntos, setAssuntos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalLogin, setModalLogin] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/assuntos`)
      .then((res) => res.json())
      .then((data) => setAssuntos(data))
      .catch(() => setErro('Não foi possível carregar os tutoriais.'))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p className="text-center text-gray-500 text-base">Carregando...</p>;
  if (erro) return <p className="text-center text-red-600 text-base">{erro}</p>;
  if (assuntos.length === 0) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">

      {/* CADASTRAR TUTORIAL */}
      <button
        type="button"
        onClick={() => {
          alert('Botão funcionando');
          setModalLogin(true);
        }}
        className="flex flex-col items-center text-center text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg"
      >
        <span className="text-4xl mb-2.5">+</span>

        <h3 className="text-base font-semibold mb-2">
          Cadastrar Tutorial
        </h3>

        <p className="text-sm text-gray-500">
          Acesso restrito
        </p>
      </button>

      {/* TUTORIAIS CADASTRADOS */}
      {assuntos.map((assunto) => (
        <Link
          to={`/guia/${assunto.slug}`}
          key={assunto.id}
          className="flex flex-col items-center text-center no-underline text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg"
        >
          {assunto.icone && (
            <span className="text-4xl mb-2.5">
              {assunto.icone}
            </span>
          )}

          <h3 className="text-base font-semibold mb-2">
            {assunto.titulo}
          </h3>

          <p className="text-sm text-gray-500">
            {assunto.descricao}
          </p>
        </Link>
      ))}

      {/* LOGIN ADMINISTRATIVO */}
      <AdminLoginModal
        aberto={modalLogin}
        onFechar={() => setModalLogin(false)}
        onLoginSucesso={() => {
          setModalLogin(false);
          window.location.href = '/cadastrar';
        }}
      />

    </div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
      <button
        type="button"
        onClick={() => setModalLogin(true)}
        className="flex flex-col items-center text-center text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg"
      >
        <span className="text-4xl mb-2.5">+</span>

        <h3 className="text-base font-semibold mb-2">
          Cadastrar Tutorial
        </h3>

        <p className="text-sm text-gray-500">
          Acesso restrito
        </p>
      </button>
      {assuntos.map((assunto) => (
        <Link
          to={`/guia/${assunto.slug}`}
          key={assunto.id}
          className="flex flex-col items-center text-center no-underline text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg"
        >
          {assunto.icone && (
            <span className="text-4xl mb-2.5">{assunto.icone}</span>
          )}
          <h3 className="text-base font-semibold mb-2">{assunto.titulo}</h3>
          <p className="text-sm text-gray-500">{assunto.descricao}</p>
        </Link>
      ))}

      <AdminLoginModal
        aberto={modalLogin}
        onFechar={() => setModalLogin(false)}
        onLoginSucesso={() => {
          setModalLogin(false);
          window.location.href = '/cadastrar';
        }}
      />

    </div>
  );
}

export default OptionsHomePage;