import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Ajuste se o seu backend rodar em outro endereço/porta
const API_URL = 'http://localhost:8000/api';
const BACKEND_URL = 'http://localhost:8000'; // usado para montar a URL completa das imagens

function GuiaPage() {
  const { slug } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setCarregando(true);
    setErro(null);

    fetch(`${API_URL}/guia.php?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.erro) {
          setErro(data.erro);
        } else {
          setDados(data);
        }
      })
      .catch(() => setErro('Não foi possível carregar o tutorial.'))
      .finally(() => setCarregando(false));
  }, [slug]);

  if (carregando) return <p className="text-center text-gray-500 text-base">Carregando...</p>;
  if (erro) return <p className="text-center text-red-600 text-base">{erro}</p>;
  if (!dados) return null;

  const { assunto, fullGuide } = dados;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Link to="/" className="inline-block mb-4 text-blue-700 no-underline font-bold hover:underline">
        &larr; Voltar
      </Link>

      <h2 className="text-2xl font-bold">{assunto.titulo}</h2>
      <p className="text-gray-500 mb-6">{assunto.descricao}</p>

      {fullGuide.map((passo, index) => (
        <div key={index} className="mb-6 pb-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{index + 1}. {passo.titulo}</h3>
          <p className="text-gray-700">{passo.descricao}</p>

          {passo.imagens && passo.imagens.map((img, i) => (
            <img
              key={i}
              src={`${BACKEND_URL}/${img}`}
              alt={passo.titulo}
              className="max-w-full rounded-lg mt-2.5 block"
            />
          ))}
        </div>
      ))}

      {assunto.video_url && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Vídeo</h3>
          <video src={assunto.video_url} controls className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default GuiaPage;