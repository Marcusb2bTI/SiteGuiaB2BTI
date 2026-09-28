import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

// Ajuste se o seu backend rodar em outro endereço/porta
const API_URL = 'http://localhost:3000/api';
const BACKEND_URL = 'http://localhost:3000'; // usado para montar a URL completa das imagens

// Número de WhatsApp da equipe de suporte (com DDI+DDD, só números)
const WHATSAPP_NUMERO = '5512997727816';

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;





function GuiaPage() {
  const { slug } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Visualizador de imagem (lightbox com zoom)
  const [imagemAberta, setImagemAberta] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const [arrastando, setArrastando] = useState(false);
  const inicioArrasto = useRef({ x: 0, y: 0 });

  const [modalSenha, setModalSenha] = useState(false);
  const [senha, setSenha] = useState('');
  const [modoAdmin, setModoAdmin] = useState(false);
  const [erroSenha, setErroSenha] = useState('');

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

  // Fecha o visualizador com a tecla Esc
  useEffect(() => {
    if (!imagemAberta) return;
    const onKey = (e) => e.key === 'Escape' && fecharImagem();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [imagemAberta]);

  function abrirImagem(url) {
    setImagemAberta(url);
    setZoom(1);
    setPosicao({ x: 0, y: 0 });
  }

  function fecharImagem() {
    setImagemAberta(null);
    setArrastando(false);
  }

  function alterarZoom(delta) {
    setZoom((z) => {
      const novo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(2)));
      if (novo === ZOOM_MIN) setPosicao({ x: 0, y: 0 });
      return novo;
    });
  }

  function resetarZoom() {
    setZoom(1);
    setPosicao({ x: 0, y: 0 });
  }

  function iniciarArrasto(e) {
    if (zoom <= 1) return;
    setArrastando(true);
    inicioArrasto.current = { x: e.clientX - posicao.x, y: e.clientY - posicao.y };
  }

  function moverArrasto(e) {
    if (!arrastando) return;
    setPosicao({
      x: e.clientX - inicioArrasto.current.x,
      y: e.clientY - inicioArrasto.current.y,
    });
  }

  function converterYoutubeUrl(url) {
    if (!url) return '';

    try {
      const urlObj = new URL(url);

      // youtube.com/watch?v=...
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // youtu.be/...
      if (urlObj.hostname === 'youtu.be') {
        const videoId = urlObj.pathname.substring(1);

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Caso já seja embed
      return url;

    } catch {
      return '';
    }
  }

  function verificarSenha() {
    if (senha === 'b2bti@12345') {
      setModoAdmin(true);
      setModalSenha(false);
      setSenha('');
      setErroSenha('');
    } else {
      setErroSenha('Senha incorreta.');
    }
  }

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

  const videoEmbed = converterYoutubeUrl(assunto.video_url);



  return (
    <div className="w-full max-w-4xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1 mb-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl no-underline font-bold shadow-sm transition-colors"
      >
        &larr; Voltar
      </Link>

      {modalSenha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-2">
              🔒 Acesso administrativo
            </h2>

            <p className="text-gray-600 mb-5">
              Digite a senha para gerenciar os assuntos.
            </p>

            <input
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErroSenha('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verificarSenha();
                }
              }}
              placeholder="Digite a senha"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />

            {erroSenha && (
              <p className="text-red-500 text-sm mt-2">
                {erroSenha}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={() => {
                  setModalSenha(false);
                  setSenha('');
                  setErroSenha('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={verificarSenha}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Entrar
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Assunto principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-gray-900">{assunto.titulo}</h2>
        {assunto.descricao && (
          <p className="text-gray-500 mt-2 text-base leading-relaxed">{assunto.descricao}</p>

        )}

        <button
          onClick={() => setModalSenha(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          🔒 Gerenciar assuntos
        </button>

        {modoAdmin && (
      <div className="flex gap-2 mt-4 justify-between flex-wrap ">

        <button
          onClick={() => handleEditar(assunto)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1"
        >
          ✏️ Editar
        </button>

        <button
          onClick={() => handleDesativar(assunto)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1"
        >
          🚫 Desativar
        </button>

      </div>
    )}
      </div>

      {/* Passos numerados, um card por passo */}
      {fullGuide.length === 0 && (
        <p className="text-gray-400 mb-8 text-center">
          Nenhum passo cadastrado ainda para este assunto.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {fullGuide.map((passo, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">{passo.titulo}</h3>
                <p className="text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                  {passo.descricao}
                </p>
              </div>
            </div>

            {passo.imagens && passo.imagens.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                {passo.imagens.map((img, i) => (
                  <img
                    key={i}
                    src={`${BACKEND_URL}/${img}`}
                    alt={passo.titulo}
                    onClick={() => abrirImagem(`${BACKEND_URL}/${img}`)}
                    className="w-full rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          
        ))}

        
      </div>

      {/* Vídeo final (se houver) */}
      {videoEmbed && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">🎥 Vídeo</h3>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <iframe
              src={videoEmbed}
              title={assunto.titulo}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Aviso final + contato WhatsApp */}
      <div className="mt-8 mb-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <p className="text-gray-700 mb-4">
          Se mesmo seguindo os passos o problema não foi resolvido, fale com a nossa equipe de suporte.
        </p>
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors no-underline"
        >
          Falar com o suporte no WhatsApp 👨🏻‍💻
        </a>
      </div>

      {/* Visualizador de imagem com zoom */}
      {imagemAberta && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center overflow-hidden select-none"
          onClick={fecharImagem}
          onMouseMove={moverArrasto}
          onMouseUp={() => setArrastando(false)}
          onMouseLeave={() => setArrastando(false)}
        >
          {/* Botão fechar */}
          <button
            onClick={fecharImagem}
            className="absolute top-4 right-5 text-white text-3xl leading-none hover:text-gray-300 z-10"
          >
            ✕
          </button>

          {/* Imagem (clicar nela não fecha) */}
          <img
            src={imagemAberta}
            alt="Imagem ampliada"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => alterarZoom(e.deltaY < 0 ? 0.25 : -0.25)}
            onMouseDown={iniciarArrasto}
            onDoubleClick={(e) => {
              e.stopPropagation();
              zoom > 1 ? resetarZoom() : setZoom(2);
            }}
            className="max-w-[92vw] max-h-[85vh] rounded-lg shadow-2xl"
            style={{
              transform: `translate(${posicao.x}px, ${posicao.y}px) scale(${zoom})`,
              cursor: zoom > 1 ? (arrastando ? 'grabbing' : 'grab') : 'pointer',
              transition: arrastando ? 'none' : 'transform 0.15s ease-out',
            }}
          />

          {/* Controles de zoom */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 rounded-full px-4 py-2 shadow-lg"
          >
            <button
              onClick={() => alterarZoom(-0.5)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <button
              onClick={resetarZoom}
              className="min-w-14 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => alterarZoom(0.5)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuiaPage;