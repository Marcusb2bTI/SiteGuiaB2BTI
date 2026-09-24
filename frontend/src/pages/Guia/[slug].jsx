import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Ajuste se o seu backend rodar em outro endereço/porta
const API_URL = 'http://localhost:3000/api';
const BACKEND_URL = 'http://localhost:3000'; // usado para montar a URL completa das imagens

// Ajuste para o número real de WhatsApp da equipe de suporte (com DDI+DDD, só números)
const WHATSAPP_NUMERO = '5512997727816';

function GuiaPage() {
  const { slug } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setCarregando(true);
    setErro(null);

    fetch(`${API_URL}/guia/${slug}`)
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
  if (!dados || !dados.assunto) {
    return <p className="text-center text-red-600 text-base">Resposta inesperada do servidor.</p>;
  }

  const { assunto, fullGuide = [] } = dados;

  const mensagemWhatsapp = encodeURIComponent(
    `Olá! Preciso de ajuda com o assunto: ${assunto.titulo}`
  );
  const linkWhatsapp = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensagemWhatsapp}`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Link to="/" className="inline-block mb-4 text-blue-700 no-underline font-bold hover:underline">
        &larr; Voltar
      </Link>

      {/* Assunto principal */}
      <h2 className="text-2xl font-bold">{assunto.titulo}</h2>
      <p className="text-gray-500 mb-8">{assunto.descricao}</p>

      {/* Passos numerados */}
      {fullGuide.length === 0 && (
        <p className="text-gray-400 mb-8">Nenhum passo cadastrado ainda para este assunto.</p>
      )}

      {fullGuide.map((passo, index) => (
        <div key={index} className="mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-1">
            {index + 1}. {passo.titulo}
          </h3>
          <p className="text-gray-700">{passo.descricao}</p>

          {passo.imagens && passo.imagens.map((img, i) => (
            <img
              key={i}
              src={`${BACKEND_URL}/${img}`}
              alt={passo.titulo}
              className="max-w-full rounded-lg mt-3 block"
            />
          ))}
        </div>
      ))}

      {/* Vídeo final (se houver) */}
      {assunto.video_url && (
        <div className="mt-8 mb-10">
          <h3 className="text-lg font-semibold mb-2">Vídeo</h3>
          <video src={assunto.video_url} controls className="w-full rounded-lg" />
        </div>
      )}

      {/* Aviso final + contato WhatsApp */}
      <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-gray-700 mb-4">
          Se mesmo seguindo os passos o problema não foi resolvido, fale com a nossa equipe de suporte.
        </p>
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          💬 Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}

export default GuiaPage;