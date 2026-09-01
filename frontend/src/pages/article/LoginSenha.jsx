import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSenha() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const verificarSenha = () => {
    if (senha === "b2bti@12345") {
      sessionStorage.setItem("acessoLiberado", "true");
      navigate("/cadastrar");
    } else {
      setErro("Senha incorreta!");
    }
  };

  return (
    <div class="bg-gray-100 h-full flex flex-col items-center justify-center" >
      <h2 class="text-2xl font-bold " style={{ margin: "30px" }}>Área restrita</h2>

      <input class="border border-gray-300  rounded" style={{ marginBottom: "30px", width: "500px" ,height: "50px"}}
        type="password"
        placeholder="Digite a senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button onClick={verificarSenha} class="button bg-blue-500 text-white p-2 m-4 rounded p-5"
       style={{width: "500px", height: "50px", marginBottom: "30px"}} >
        Entrar
      </button>

      {erro && <p class="text-red-500 text-xl" style={{ marginBottom: "10px" }}> {erro}</p>}
    </div>
  );
}