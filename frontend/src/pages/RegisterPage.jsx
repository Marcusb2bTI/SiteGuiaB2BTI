import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaLightbulb,
  FaCamera 
} from 'react-icons/fa';
import { RiBookShelfLine } from "react-icons/ri";
import { RxPencil2 } from "react-icons/rx";


// Ajuste essa URL se o seu backend rodar em outro endereço/porta
const API_URL = 'https://siteguiab2bti.onrender.com/api';

function RegisterPage() {
  const navigate = useNavigate();

  // Dados do tutorial (o "assunto" / card)
  const [assuntoTitulo, setAssuntoTitulo] = useState('');
  const [assuntoDescricao, setAssuntoDescricao] = useState('');
  const [assuntoIcone, setAssuntoIcone] = useState('');
  const [assuntoVideoUrl, setAssuntoVideoUrl] = useState('');

  // Passos do guia
  const [fullGuide, setFullGuide] = useState([]);

  // Formulário de um passo individual
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [enviando, setEnviando] = useState(false);

  const fileInputRef = useRef(null);

  const iconesDisponiveis = [
  { icone: FaPrint, nome: 'Impressora', valor: 'FaPrint' },
  { icone: FaLaptop, nome: 'Computador', valor: 'FaLaptop' },
  { icone: FaDesktop, nome: 'Monitor', valor: 'FaDesktop' },
  { icone: FaKeyboard, nome: 'Teclado', valor: 'FaKeyboard' },
  { icone: FaMouse, nome: 'Mouse', valor: 'FaMouse' },
  { icone: FaMobileAlt, nome: 'Celular', valor: 'FaMobileAlt' },
  { icone: FaFileInvoice, nome: 'Nota fiscal', valor: 'FaFileInvoice' },
  { icone: FaMoneyBillWave, nome: 'Financeiro', valor: 'FaMoneyBillWave' },
  { icone: FaUniversity, nome: 'Banco', valor: 'FaUniversity' },
  { icone: FaTools, nome: 'Configuração', valor: 'FaTools' },
  { icone: FaCog, nome: 'Sistema', valor: 'FaCog' },
  { icone: FaLock, nome: 'Segurança', valor: 'FaLock' },
  { icone: FaKey, nome: 'Acesso', valor: 'FaKey' },
  { icone: FaFileAlt, nome: 'Documento', valor: 'FaFileAlt' },
  { icone: FaFolder, nome: 'Arquivo', valor: 'FaFolder' },
  { icone: FaEnvelope, nome: 'E-mail', valor: 'FaEnvelope' },
  { icone: FaGlobe, nome: 'Internet', valor: 'FaGlobe' },
  { icone: FaQuestionCircle, nome: 'Dúvida', valor: 'FaQuestionCircle' },
  { icone: FaLightbulb, nome: 'Informação', valor: 'FaLightbulb' }
];

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function openFileSelector() {
    fileInputRef.current.click();
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function saveStep() {
    if (!title || !description) {
      alert("Preencha todos os campos!");
      return;
    }

    if (editingIndex !== null) {
      // Editando um passo existente
      const updatedFullGuide = [...fullGuide];

      updatedFullGuide[editingIndex] = {
        ...updatedFullGuide[editingIndex],
        titulo: title,
        descricao: description,
        ...(imageFile && { _file: imageFile })
      };

      setFullGuide(updatedFullGuide);
      setEditingIndex(null);
    } else {
      // Novo passo
      if (!imageFile) {
        alert("Selecione uma imagem!");
        return;
      }

      const newItem = {
        titulo: title,
        descricao: description,
        _file: imageFile
      };

      setFullGuide(prev => [...prev, newItem]);
    }

    setTitle('');
    setDescription('');
    setImageFile(null);
    setPreview(null);
  }

  function handleEdit(index) {
    const item = fullGuide[index];
    setTitle(item.titulo);
    setDescription(item.descricao);
    setEditingIndex(index);
    if (item._file) setPreview(URL.createObjectURL(item._file));
  }

  function handleDelete(index) {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    setFullGuide(fullGuide.filter((_, i) => i !== index));
  }

  async function handleCadastrarTutorial() {
    if (!assuntoTitulo) {
      alert("Preencha o título do tutorial!");
      return;
    }

    if (fullGuide.length === 0) {
      alert("Cadastre pelo menos um passo!");
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append('titulo', assuntoTitulo);
      formData.append('descricao', assuntoDescricao);
      formData.append('icone', assuntoIcone);
      formData.append('video_url', assuntoVideoUrl);

      formData.append('passos', JSON.stringify(
        fullGuide.map(p => ({ titulo: p.titulo, descricao: p.descricao }))
      ));

      fullGuide.forEach((passo, index) => {
        if (passo._file) formData.append(`imagem_${index}`, passo._file);
      });

      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/cadastrar-tutorial`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const resultado = await res.json();

      if (!res.ok || resultado.erro) {
        alert(resultado.erro || "Erro ao cadastrar tutorial");
        return;
      }

      // Cadastrado com sucesso -> volta pra tela inicial com os cards
      navigate('/');
    } catch (err) {
      alert("Falha ao conectar com o servidor: " + err.message);
    } finally {
      setEnviando(false);
    }
  }

  const inputClass =
    "w-full border border-gray-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";


  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* =====================================================
        CABEÇALHO
    ===================================================== */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 py-5">

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-5"
          >
            ← Voltar para o início
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Cadastrar novo tutorial
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Crie um assunto e organize o passo a passo para os usuários.
            </p>
          </div>

        </div>
      </header>


      {/* =====================================================
        CONTEÚDO
    ===================================================== */}
      <main className="max-w-5xl mx-auto px-5 py-8">

        {/* ===================================================
          INFORMAÇÕES DO TUTORIAL
      =================================================== */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                <RiBookShelfLine />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Informações do tutorial
                </h2>

                <p className="text-sm text-gray-500">
                  Defina como o tutorial aparecerá na página inicial.
                </p>
              </div>

            </div>
          </div>


          <div className="p-6 space-y-6">

            {/* TÍTULO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título do tutorial
              </label>

              <input
                className={inputClass}
                type="text"
                placeholder="Ex: Caixa, Pallas, Nota Fiscal..."
                value={assuntoTitulo}
                onChange={(e) => setAssuntoTitulo(e.target.value)}
              />
            </div>


            {/* DESCRIÇÃO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>

              <textarea
                className={`${inputClass} resize-none`}
                placeholder="Explique brevemente sobre o que trata este tutorial."
                value={assuntoDescricao}
                onChange={(e) => setAssuntoDescricao(e.target.value)}
                rows={3}
              />
            </div>


            {/* ÍCONE */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ícone do tutorial
              </label>

              <p className="text-xs text-gray-500 mb-3">
                Escolha o ícone que representará este assunto.
              </p>

              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">

                {iconesDisponiveis.map((item) => {

                  const Icone = item.icone;

                  const selecionado =
                    assuntoIcone === item.valor;

                  return (
                    <button
                      key={item.valor}
                      type="button"
                      title={item.nome}
                      onClick={() => setAssuntoIcone(item.valor)}
                      className={`
                      h-16
                      rounded-xl
                      border
                      flex
                      flex-col
                      items-center
                      justify-center
                      transition-all
                      duration-200
                      ${selecionado
                          ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100'
                          : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                        }
                    `}
                    >
                      <Icone className="text-xl" />

                      <span className="text-[9px] mt-1 leading-none">
                        {item.nome}
                      </span>
                    </button>
                  );

                })}

              </div>

              {assuntoIcone && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">

                  <span>
                    Ícone selecionado:
                  </span>

                  <span>
                    {
                      iconesDisponiveis.find(
                        (item) =>
                          item.valor === assuntoIcone
                      )?.nome
                    }
                  </span>

                </div>
              )}

            </div>


            {/* VÍDEO */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vídeo do tutorial
                <span className="ml-2 font-normal text-gray-400">
                  opcional
                </span>
              </label>

              <input
                className={inputClass}
                type="text"
                placeholder="Cole aqui o link do vídeo do YouTube"
                value={assuntoVideoUrl}
                onChange={(e) => setAssuntoVideoUrl(e.target.value)}
              />

              <p className="mt-1.5 text-xs text-gray-400">
                O vídeo será exibido na página do tutorial.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
          ADICIONAR PASSO
      =================================================== */}
        <section className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <RxPencil2 />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingIndex !== null
                    ? 'Editar passo'
                    : 'Adicionar passo'}
                </h2>

                <p className="text-sm text-gray-500">
                  Adicione as instruções e uma imagem para ajudar na explicação.
                </p>
              </div>

            </div>

          </div>


          <div className="p-6 space-y-6">

            {/* TÍTULO DO PASSO */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título do passo
              </label>

              <input
                className={inputClass}
                type="text"
                placeholder="Ex: Abra o sistema Pallas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

            </div>


            {/* DESCRIÇÃO DO PASSO */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição do passo
              </label>

              <textarea
                className={`${inputClass} resize-none`}
                placeholder="Descreva detalhadamente o que o usuário precisa fazer."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />

            </div>


            {/* IMAGEM */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imagem do passo
              </label>

              <div
                onClick={openFileSelector}
                className={`
                relative
                w-full
                min-h-[220px]
                border-2
                border-dashed
                rounded-2xl
                flex
                justify-center
                items-center
                cursor-pointer
                overflow-hidden
                transition-all
                ${preview
                    ? 'border-blue-300 bg-gray-50'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
                  }
              `}
              >

                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {preview ? (

                  <>

                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-[320px] max-w-full object-contain p-4"
                    />

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs">
                      Clique para trocar a imagem
                    </div>

                  </>

                ) : (

                  <div className="text-center px-5 py-10">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl mb-3">
                      <FaCamera />
                    </div>

                    <p className="font-semibold text-gray-700">
                      Adicione uma imagem
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Clique aqui para selecionar um arquivo
                    </p>

                    <p className="text-xs text-gray-400 mt-3">
                      PNG, JPG ou JPEG
                    </p>

                  </div>

                )}

              </div>

            </div>


            {/* BOTÃO DO PASSO */}
            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={saveStep}
                className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                {editingIndex !== null
                  ? '✓ Salvar alterações'
                  : '+ Adicionar passo'}
              </button>

              {editingIndex !== null && (

                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setTitle('');
                    setDescription('');
                    setImageFile(null);
                    setPreview(null);
                  }}
                  className="h-11 px-5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>

              )}

            </div>

          </div>

        </section>


        {/* ===================================================
          PASSOS CADASTRADOS
      =================================================== */}
        <section className="mt-6">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Passos cadastrados
              </h2>

              <p className="text-sm text-gray-500">
                Confira as etapas antes de publicar o tutorial.
              </p>

            </div>

            <div className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold">
              {fullGuide.length}{' '}
              {fullGuide.length === 1 ? 'passo' : 'passos'}
            </div>

          </div>


          {fullGuide.length === 0 ? (

            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-3">
                <RxPencil2 />
              </div>

              <p className="font-semibold text-gray-600">
                Nenhum passo adicionado
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Os passos adicionados aparecerão aqui.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {fullGuide.map((item, index) => (

                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >

                  <div className="flex flex-col sm:flex-row gap-4">

                    {/* NÚMERO */}
                    <div className="flex-shrink-0">

                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                    </div>


                    {/* CONTEÚDO */}
                    <div className="flex-1 min-w-0">

                      <h3 className="font-bold text-gray-900">
                        {item.titulo}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        {item.descricao}
                      </p>

                      {item._file && (

                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                          ✓ Imagem adicionada
                        </div>

                      )}

                    </div>


                    {/* AÇÕES */}
                    <div className="flex sm:flex-col gap-2">

                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
                      >
                        Excluir
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ===================================================
          PUBLICAR
      =================================================== */}
        <section className="mt-8">

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <h3 className="font-bold text-gray-900">
                  Pronto para publicar?
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Revise as informações e publique o tutorial.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCadastrarTutorial}
                disabled={enviando}
                className={`
                h-12
                px-7
                rounded-xl
                font-bold
                text-sm
                text-white
                transition-all
                ${enviando
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                  }
              `}
              >
                {enviando
                  ? 'Cadastrando...'
                  : '✓ Cadastrar tutorial'}
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
  export default RegisterPage;