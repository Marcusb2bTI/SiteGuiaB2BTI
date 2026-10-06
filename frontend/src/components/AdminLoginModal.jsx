import { useState } from 'react';

const BACKEND_URL = 'http://localhost:3000';

function AdminLoginModal({
  aberto,
  onFechar,
  onLoginSucesso
}) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!aberto) {
    return null;
  }

  async function fazerLogin() {
    if (!usuario || !senha) {
      setErro('Informe usuário e senha.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usuario,
            senha
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro || 'Usuário ou senha inválidos.'
        );
      }

      // Guarda o token para as próximas requisições
      localStorage.setItem('token', data.token);

      // Informa ao componente que o login deu certo
      if (onLoginSucesso) {
        onLoginSucesso(data);
      }

      // Limpa os campos
      setUsuario('');
      setSenha('');
      setErro('');

    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function fecharModal() {
    setUsuario('');
    setSenha('');
    setErro('');
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

        <h2 className="text-xl font-bold mb-2">
           Acesso administrativo
        </h2>

        <p className="text-gray-600 mb-5">
          Informe seu usuário e senha para continuar.
        </p>

        {/* USUÁRIO */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Usuário
          </label>

          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Digite seu usuário:"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* SENHA */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Senha
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fazerLogin();
              }
            }}
            placeholder="Digite sua senha:"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ERRO */}
        {erro && (
          <p className="text-red-600 text-sm mb-4">
            {erro}
          </p>
        )}

        {/* BOTÕES */}
        <div className="flex justify-end gap-2">

          <button
            type="button"
            onClick={fecharModal}
            disabled={carregando}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={fazerLogin}
            disabled={carregando}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

        </div>

      </div>

    </div>
  );
}

export default AdminLoginModal;