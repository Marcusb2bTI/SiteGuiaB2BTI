
import { useState } from 'react';

const BACKEND_URL = 'https://siteguiab2bti.onrender.com';

function AdminLoginModal({
  aberto,
  onFechar,
  onLoginSucesso
}) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!aberto) {
    return null;
  }

  async function fazerLogin() {
    if (!senha) {
      setErro('Informe a senha.');
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
            usuario: 'admin',
            senha: senha
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

      setSenha('');
      setErro('');

    } catch (error) {
      console.error('Erro no login:', error);
      setErro(error.message);

    } finally {
      setCarregando(false);
    }
  }

  function fecharModal() {
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
          Informe a senha para continuar.
        </p>

        {/* USUÁRIO FIXO */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Usuário
          </label>

          <input
            type="text"
            value="admin"
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
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
            autoFocus
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
