import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLoginModal from '../../components/AdminLoginModal';

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

  // Modo Admin (senha para editar/desativar)
  const [modalLogin, setModalLogin] = useState(false);
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  const [acaoAdmin, setAcaoAdmin] = useState(null);

  // Modal de edição
  const [modalEdicao, setModalEdicao] = useState(false);
  const [editPassos, setEditPassos] = useState([]);

  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editIcone, setEditIcone] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');

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

      setModalSenha(false);

      // aqui vamos executar a ação que o usuário escolheu
      if (acaoAdmin?.tipo === 'editar') {
        handleEditar(acaoAdmin.assunto);
      }

      if (acaoAdmin?.tipo === 'desativar') {
        handleDesativar(acaoAdmin.assunto);
      }

      setSenha('');
      setErroSenha('');

    } else {
      setErroSenha('Senha incorreta.');
    }
  }

  function pedirLogin(acao, assunto) {
    setAcaoAdmin({
      tipo: acao,
      assunto: assunto
    });

    setUsuarioLogin('');
    setSenhaLogin('');
    setErroLogin('');
    setModalLogin(true);
  }

  async function fazerLogin() {

    if (!usuarioLogin || !senhaLogin) {
      setErroLogin('Informe usuário e senha.');
      return;
    }

    setCarregandoLogin(true);
    setErroLogin('');

    try {

      const response = await fetch(
        `${BACKEND_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usuario: usuarioLogin,
            senha: senhaLogin
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.erro || 'Usuário ou senha inválidos.'
        );
      }


      // Guarda o token
      localStorage.setItem(
        'token',
        data.token
      );


      // Fecha o modal
      setModalLogin(false);

      setUsuarioLogin('');
      setSenhaLogin('');
      setErroLogin('');


      // Executa a ação que o usuário tentou fazer
      if (acaoAdmin?.tipo === 'editar') {
        handleEditar(acaoAdmin.assunto);
      }


      if (acaoAdmin?.tipo === 'desativar') {
        handleDesativar(acaoAdmin.assunto);
      }


    } catch (error) {

      console.error(error);

      setErroLogin(error.message);

    } finally {

      setCarregandoLogin(false);

    }
  }

  function handleEditar(assunto) {
    setEditTitulo(assunto.titulo || '');
    setEditDescricao(assunto.descricao || '');
    setEditIcone(assunto.icone || '');
    setEditVideoUrl(assunto.video_url || '');

    // Cria uma cópia dos passos atuais para podermos editar
    const passosEditaveis = fullGuide.map((passo) => ({
      ...passo,
      imagens: passo.imagens ? [...passo.imagens] : []
    }));

    setEditPassos(passosEditaveis);

    setModalEdicao(true);
  }

  async function handleDesativar(assunto) {

    const confirmar = window.confirm(
      `Tem certeza que deseja desativar o assunto "${assunto.titulo}"?`
    );

    if (!confirmar) return;


    try {

      const token = localStorage.getItem('token');

      const response = await fetch(
        `${BACKEND_URL}/api/assuntos/${assunto.id}/desativar`,
        {
          method: 'PATCH',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.erro || 'Não foi possível desativar o assunto.'
        );
      }


      alert('Assunto desativado com sucesso!');


      // Volta para a página inicial
      window.location.href = '/';


    } catch (error) {

      console.error(error);

      alert(
        'Erro ao desativar o assunto: ' +
        error.message
      );

    }
  }

  function alterarPasso(index, campo, valor) {
    setEditPassos((passos) =>
      passos.map((passo, i) =>
        i === index
          ? { ...passo, [campo]: valor }
          : passo
      )
    );
  }

  function adicionarPassoEdicao() {
    setEditPassos((passos) => [
      ...passos,
      {
        titulo: '',
        descricao: '',
        imagens: []
      }
    ]);
  }

  function removerPassoEdicao(index) {
    const confirmar = window.confirm(
      'Tem certeza que deseja remover este passo?'
    );

    if (!confirmar) return;

    setEditPassos((passos) =>
      passos.filter((_, i) => i !== index)
    );
  }

  function adicionarImagemPasso(index, file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const novaImagem = {
        file: file,
        preview: reader.result
      };

      setEditPassos((passos) =>
        passos.map((passo, i) =>
          i === index
            ? {
              ...passo,
              imagens: [...(passo.imagens || []), novaImagem]
            }
            : passo
        )
      );
    };

    reader.readAsDataURL(file);
  }

  function removerImagemPasso(passoIndex, imagemIndex) {
    setEditPassos((passos) =>
      passos.map((passo, i) =>
        i === passoIndex
          ? {
            ...passo,
            imagens: passo.imagens.filter(
              (_, imgIndex) => imgIndex !== imagemIndex
            )
          }
          : passo
      )
    );
  }

  function obterUrlImagem(img) {
    if (!img) return '';

    if (img.startsWith('http')) {
      return img;
    }

    return `${BACKEND_URL}/${img}`;
  }

  async function salvarEdicao() {
    try {

      const formData = new FormData();

      formData.append('titulo', editTitulo);
      formData.append('descricao', editDescricao);
      formData.append('icone', editIcone);
      formData.append('video_url', editVideoUrl);


      const passosParaEnviar = editPassos.map((passo) => ({
        id: passo.id || null,
        titulo: passo.titulo || '',
        descricao: passo.descricao || '',
        imagens: (passo.imagens || []).filter(
          (img) => typeof img === 'string'
        )
      }));


      formData.append(
        'passos',
        JSON.stringify(passosParaEnviar)
      );


      // Adiciona as novas imagens
      editPassos.forEach((passo, index) => {

        (passo.imagens || []).forEach((imagem) => {

          if (imagem.file) {

            formData.append(
              `imagem_${index}`,
              imagem.file
            );

          }

        });

      });

      const token = localStorage.getItem('token');

      const response = await fetch(
        `${BACKEND_URL}/api/assuntos/${assunto.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.erro || 'Erro ao salvar alterações'
        );
      }


      alert('Alterações salvas com sucesso!');

      setModalEdicao(false);


      // Recarrega a página para buscar os dados atualizados
      window.location.reload();


    } catch (error) {

      console.error(error);

      alert(
        'Não foi possível salvar as alterações: ' +
        error.message
      );

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

      {/* Modal de senha */}
      <AdminLoginModal
        aberto={modalLogin}
        onFechar={() => setModalLogin(false)}
        onLoginSucesso={() => {
          setModalLogin(false);

          if (acaoAdmin?.tipo === 'editar') {
            handleEditar(acaoAdmin.assunto);
          }

          if (acaoAdmin?.tipo === 'desativar') {
            handleDesativar(acaoAdmin.assunto);
          }
        }}
      />

      {/* Modal de edição/Passos */}
      {modalEdicao && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">

          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-gray-900">
                ✏️ Editar assunto
              </h2>

              <button
                onClick={() => setModalEdicao(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>

            </div>


            {/* ============================= */}
            {/* DADOS DO ASSUNTO */}
            {/* ============================= */}

            <div className="border-b border-gray-200 pb-6">

              <h3 className="text-lg font-semibold mb-4">
                Informações do assunto
              </h3>

              {/* Título */}
              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Título
                </label>

                <input
                  type="text"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />

              </div>


              {/* Descrição */}
              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descrição
                </label>

                <textarea
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-none"
                />

              </div>


              {/* Emoji */}
              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ícone
                </label>

                <select
                  value={editIcone}
                  onChange={(e) => setEditIcone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                >

                  <option value="">Selecione um emoji</option>

                  <option value="🖨️">🖨️ Impressora</option>
                  <option value="💻">💻 Computador</option>
                  <option value="🖥️">🖥️ Monitor</option>
                  <option value="⌨️">⌨️ Teclado</option>
                  <option value="🖱️">🖱️ Mouse</option>
                  <option value="📱">📱 Celular</option>
                  <option value="🧾">🧾 Nota fiscal</option>
                  <option value="💰">💰 Financeiro</option>
                  <option value="🏦">🏦 Banco</option>
                  <option value="🔧">🔧 Configuração</option>
                  <option value="⚙️">⚙️ Sistema</option>
                  <option value="🔒">🔒 Segurança</option>
                  <option value="🔑">🔑 Acesso</option>
                  <option value="📄">📄 Documento</option>
                  <option value="📁">📁 Arquivo</option>
                  <option value="📧">📧 E-mail</option>
                  <option value="🌐">🌐 Internet</option>
                  <option value="❓">❓ Dúvida</option>
                  <option value="💡">💡 Informação</option>

                </select>

              </div>


              {/* Vídeo */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Link do vídeo
                </label>

                <input
                  type="text"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />

              </div>

            </div>


            {/* ============================= */}
            {/* PASSOS */}
            {/* ============================= */}

            <div className="mt-6">

              <div className="flex items-center justify-between mb-4">

                <h3 className="text-lg font-semibold">
                  📋 Passos do tutorial
                </h3>

                <button
                  onClick={adicionarPassoEdicao}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Adicionar passo
                </button>

              </div>


              {editPassos.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Nenhum passo cadastrado.
                </p>
              )}


              {editPassos.map((passo, index) => (

                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5 mb-5 bg-gray-50"
                >

                  {/* Cabeçalho do passo */}
                  <div className="flex items-center justify-between mb-4">

                    <h4 className="font-bold text-lg">
                      Passo {index + 1}
                    </h4>

                    <button
                      onClick={() => removerPassoEdicao(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      🗑️ Remover passo
                    </button>

                  </div>


                  {/* Título do passo */}
                  <div className="mb-4">

                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Título do passo
                    </label>

                    <input
                      type="text"
                      value={passo.titulo || ''}
                      onChange={(e) =>
                        alterarPasso(index, 'titulo', e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                    />

                  </div>


                  {/* Descrição do passo */}
                  <div className="mb-4">

                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Descrição do passo
                    </label>

                    <textarea
                      value={passo.descricao || ''}
                      onChange={(e) =>
                        alterarPasso(index, 'descricao', e.target.value)
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-none bg-white"
                    />

                  </div>


                  {/* Imagens */}
                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Imagens
                    </label>


                    {passo.imagens && passo.imagens.length > 0 && (

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">

                        {passo.imagens.map((img, imgIndex) => {

                          const imagemSrc =
                            typeof img === 'string'
                              ? obterUrlImagem(img)
                              : img.preview;

                          return (

                            <div
                              key={imgIndex}
                              className="relative border border-gray-200 rounded-lg overflow-hidden bg-white"
                            >

                              <img
                                src={imagemSrc}
                                alt={`Imagem do passo ${index + 1}`}
                                className="w-full h-32 object-contain"
                              />

                              <button
                                onClick={() =>
                                  removerImagemPasso(index, imgIndex)
                                }
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 hover:bg-red-700"
                              >
                                ✕
                              </button>

                            </div>

                          );
                        })}

                      </div>

                    )}


                    {/* Adicionar imagem */}
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">

                      🖼️ Adicionar imagem

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          adicionarImagemPasso(
                            index,
                            e.target.files[0]
                          );

                          e.target.value = '';
                        }}
                      />

                    </label>

                  </div>

                </div>

              ))}

            </div>


            {/* ============================= */}
            {/* BOTÕES */}
            {/* ============================= */}

            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-200">

              <button
                onClick={() => setModalEdicao(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEdicao}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                💾 Salvar
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Modal de login */}
      {modalLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-bold mb-2">
              🔐 Acesso administrativo
            </h2>

            <p className="text-gray-600 mb-5">
              Informe seu usuário e senha para continuar.
            </p>


            <div className="mb-4">

              <label className="block text-sm font-medium mb-1">
                Usuário
              </label>

              <input
                type="text"
                value={usuarioLogin}
                onChange={(e) => setUsuarioLogin(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            <div className="mb-4">

              <label className="block text-sm font-medium mb-1">
                Senha
              </label>

              <input
                type="password"
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fazerLogin();
                  }
                }}
                placeholder="Digite sua senha"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {erroLogin && (
              <p className="text-red-600 text-sm mb-4">
                {erroLogin}
              </p>
            )}


            <div className="flex justify-end gap-2">

              <button
                type="button"
                onClick={() => {
                  setModalLogin(false);
                  setErroLogin('');
                }}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancelar
              </button>


              <button
                type="button"
                onClick={fazerLogin}
                disabled={carregandoLogin}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {carregandoLogin
                  ? 'Entrando...'
                  : 'Entrar'}
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

        {/* Assunto principal */}
        <div className="flex flex-col gap-4">


          {/* Botões administrativos */}
          <div className="flex gap-2 justify-between">

            <button
              onClick={() => pedirLogin('editar', assunto)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex-1 hover:bg-blue-700 transition-colors"
            >
              ✏️ Editar
            </button>

            <button
              onClick={() => pedirLogin('desativar', assunto)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex-1 hover:bg-red-700 transition-colors"
            >
              🚫 Desativar
            </button>

          </div>

        </div>

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
                {passo.imagens.map((img, i) => {
                  console.log('URL DA IMAGEM:', img);

                  return (
                    <img
                      key={img}
                      src={
                        img.startsWith('http')
                          ? img
                          : `${BACKEND_URL}/${img}`
                      }
                      alt={passo.titulo}
                      onClick={() =>
                        abrirImagem(
                          img.startsWith('http')
                            ? img
                            : `${BACKEND_URL}/${img}`
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  );
                })}
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