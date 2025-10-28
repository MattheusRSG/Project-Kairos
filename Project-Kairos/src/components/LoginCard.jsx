import React, { useState } from "react";
import axios from "axios";
import "../css/CardLogin.css";

export default function LoginCard({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [resetData, setResetData] = useState({
    email: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [alert, setAlert] = useState("");
  const [resetMode, setResetMode] = useState(false);

  // 🔹 Atualiza campos de login
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Atualiza campos de reset
  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  // 🔹 LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8081/api/auth/login",
        formData
      );

      const { token, email, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email, role }));

      onLoginSuccess({ email, role });
    } catch (err) {
      setAlert(err.response?.data || "Erro ao logar. Verifique suas credenciais.");
    }
  };

  // 🔹 RESET DE SENHA
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetData.novaSenha !== resetData.confirmarSenha) {
      setAlert("As senhas não coincidem.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8081/api/auth/resetar-senha", {
        email: resetData.email,
        novaSenha: resetData.novaSenha,
      });

      // ✅ Exibe mensagem de sucesso
      setAlert(res.data || "Senha redefinida com sucesso!");

      // ✅ Volta ao modo login após 2 segundos
      setTimeout(() => {
        setResetMode(false);
        setAlert("");
      }, 2000);
    } catch (err) {
      setAlert(err.response?.data || "Erro ao redefinir senha.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="brand">Bem-vindo</h1>
        <p className="subtitle">
          {resetMode ? "Redefinir Senha" : "Entre na sua conta"}
        </p>

        {alert && (
          <div
            className={`alert ${
              alert.toLowerCase().includes("sucesso") ? "success" : "error"
            }`}
          >
            {alert}
          </div>
        )}

        {!resetMode ? (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </label>
            <label>
              <span>Senha</span>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </label>

            <button type="submit" className="btn">
              Entrar
            </button>

            <p
              className="link"
              onClick={() => {
                setResetMode(true);
                setAlert("");
              }}
            >
              Esqueceu sua senha?
            </p>
          </form>
        ) : (
          <form className="form" onSubmit={handleResetPassword}>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={resetData.email}
                onChange={handleResetChange}
                placeholder="Digite seu email"
                required
              />
            </label>
            <label>
              <span>Nova Senha</span>
              <input
                type="password"
                name="novaSenha"
                value={resetData.novaSenha}
                onChange={handleResetChange}
                placeholder="Nova senha"
                required
              />
            </label>
            <label>
              <span>Confirmar Senha</span>
              <input
                type="password"
                name="confirmarSenha"
                value={resetData.confirmarSenha}
                onChange={handleResetChange}
                placeholder="Confirme a senha"
                required
              />
            </label>

            <button type="submit" className="btn">
              Redefinir Senha
            </button>

            <p
              className="link"
              onClick={() => {
                setResetMode(false);
                setAlert("");
              }}
            >
              Voltar ao login
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
