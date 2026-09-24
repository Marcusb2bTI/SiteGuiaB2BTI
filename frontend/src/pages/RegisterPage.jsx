import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Ajuste essa URL se o seu backend rodar em outro endereço/porta
const API_URL = 'http://localhost:3000/api';

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

      const res = await fetch(`${API_URL}/cadastrar-tutorial`, {
        method: 'POST',
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
    <div className="flex flex-col items-center px-5 py-10 min-h-screen bg-gray-100 font-sans">
      {/* Dados do tutorial */}
      <div className="w-full max-w-xl flex flex-col items-center gap-5 bg-white p-8 my-5 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold">Dados do tutorial</h2>

        <input
          className={inputClass}
          type="text"
          placeholder="Título do tutorial (ex: Caixa)"
          value={assuntoTitulo}
          onChange={(e) => setAssuntoTitulo(e.target.value)}
        />

        <textarea
          className={`${inputClass} resize-none`}
          placeholder="Descrição do tutorial"
          value={assuntoDescricao}
          onChange={(e) => setAssuntoDescricao(e.target.value)}
          rows={3}
        />

        <input
          className={inputClass}
          type="text"
          placeholder="Emoji do card (ex: 🖨️)"
          value={assuntoIcone}
          onChange={(e) => setAssuntoIcone(e.target.value)}
          maxLength={4}
        />

        <input
          className={inputClass}
          type="text"
          placeholder="Link do vídeo final (opcional)"
          value={assuntoVideoUrl}
          onChange={(e) => setAssuntoVideoUrl(e.target.value)}
        />
      </div>

      {/* Formulário de passo */}
      <div className="w-full max-w-xl flex flex-col items-center gap-5 bg-white p-8 rounded-2xl shadow-md mt-5">
        <h2 className="text-xl font-bold">
          {editingIndex !== null ? "Editar passo" : "Adicionar passo"}
        </h2>

        <input
          className={inputClass}
          type="text"
          placeholder="Título do passo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={`${inputClass} resize-none`}
          placeholder="Descrição do passo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <div
          onClick={openFileSelector}
          className="w-full border-4 border-dotted border-gray-400 rounded-lg h-36 flex justify-center items-center cursor-pointer overflow-hidden bg-gray-50"
        >
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-gray-400">Clique para selecionar imagem</span>
          )}
        </div>

        <button
          onClick={saveStep}
          className="w-full bg-white text-black border border-black rounded-lg h-10 font-bold hover:bg-gray-100 transition-colors"
        >
          {editingIndex !== null ? "Salvar Alterações" : "Adicionar Passo"}
        </button>
      </div>

      {/* Lista de passos cadastrados */}
      <div className="w-full max-w-xl mt-8">
        <h2 className="text-center text-xl font-bold mb-5">Passos cadastrados</h2>

        {fullGuide.length === 0 && (
          <p className="text-center text-gray-400">Nenhum passo adicionado ainda.</p>
        )}

        {fullGuide.map((item, index) => (
          <div
            key={index}
            className="bg-white px-5 py-4 rounded-lg mb-4 shadow-sm flex flex-col items-center gap-2.5"
          >
            <div className="text-center">
              <strong>{item.titulo}</strong>
              <p className="mt-1 text-gray-600">{item.descricao}</p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => handleEdit(index)}
                className="border-none px-3 py-2 rounded-md bg-blue-600 text-white cursor-pointer min-w-[70px] hover:bg-blue-700 transition-colors"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(index)}
                className="border-none px-3 py-2 rounded-md bg-red-500 text-white cursor-pointer min-w-[70px] hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCadastrarTutorial}
        disabled={enviando}
        className={`w-full max-w-xl border-none rounded-lg h-12 font-bold mt-5 text-base text-white transition-colors ${
          enviando ? "bg-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 cursor-pointer"
        }`}
      >
        {enviando ? "Cadastrando..." : "Cadastrar Tutorial"}
      </button>
    </div>
  );
}

export default RegisterPage;