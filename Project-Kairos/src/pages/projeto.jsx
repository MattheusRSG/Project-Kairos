import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/projetos.css";

// Lista de tags para o Multi-Select (usaremos para o filtro também)
const LINGUAGENS_OPTIONS = [
    "JavaScript", "Python", "Java", "C#", "C++", "React", "Angular", 
    "Vue.js", "Node.js", "Spring Boot", "SQL", "MongoDB", "AWS", "Docker"
];


export default function ProjetosList() {
    const [projetos, setProjetos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [tags, setTags] = useState([]); // Array para armazenar as tags selecionadas
    const [regime, setRegime] = useState("PJ"); 
    const [dataInicio, setDataInicio] = useState(""); 
    const [dataFim, setDataFim] = useState(""); 

    // Filtros de busca de texto
    const [filtroTexto, setFiltroTexto] = useState(""); 
    
    // 🚩 NOVOS ESTADOS DE FILTRO
    const [filtroRegime, setFiltroRegime] = useState("TODOS"); 
    const [filtroTag, setFiltroTag] = useState("TODAS"); 
    
    // Aluno:
    const [modoAluno, setModoAluno] = useState("TODOS"); 
    const [projetosInscritosIds, setProjetosInscritosIds] = useState([]);

    const baseURL = "http://localhost:8081/api/projetos";
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const role = user?.role || "";

    // Função utilitária para converter a string de tags em um array limpo
    const parseTagsString = (tagsString) => {
        if (!tagsString || typeof tagsString !== 'string') return [];
        return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    };
    
    // 🔹 Função utilitária para criar um objeto Date robusto
    const parseDate = (dateData) => {
        if (!dateData) return null;
        
        if (Array.isArray(dateData) && dateData.length >= 3) {
            const date = new Date(dateData[0], dateData[1] - 1, dateData[2]);
            if (isNaN(date)) return null;
            return date;
        }
        
        const date = new Date(dateData);
        if (isNaN(date)) return null;
        return date;
    }

    // 🔹 Lógica de Duração
    const getDurationInMonths = (start, end) => {
        if (!start || !end) return "N/I";
        
        const startDate = parseDate(start);
        const endDate = parseDate(end);

        if (!startDate || !endDate) return "N/I";
        
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} dias`;
        
        const diffMonths = Math.round(diffDays / 30.44); 
        return `${diffMonths} meses`;
    }


    // Função para buscar projetos e inscrições do aluno
    const fetchProjetos = async () => {
        try {
            let url = `${baseURL}/public`;
            let config = {};
            let isFetchingInscricoes = false;

            if (role === "ROLE_EMPRESA" && token) {
                url = `${baseURL}/meus`;
                config = { headers: { Authorization: `Bearer ${token}` } };
            } else if (role === "ROLE_ALUNO" && token) {
                if (modoAluno === "INSCRITOS") {
                    url = `${baseURL}/inscricoes`;
                    config = { headers: { Authorization: `Bearer ${token}` } };
                    isFetchingInscricoes = true; // Define que estamos na rota de inscrições
                } else {
                    url = `${baseURL}/public`;
                    config = {};
                }
            }

            const res = await axios.get(url, config);
            
            // Busca a lista de IDs inscritos para desabilitar o botão 'Inscrever-se' (modo TODOS)
            if (role === "ROLE_ALUNO" && token) {
                const inscricoesRes = await axios.get(`${baseURL}/inscricoes`, 
                    { headers: { Authorization: `Bearer ${token}` } });
                    
                // Mapeia os IDs dos projetos inscritos
                // Nota: o objeto p aqui é o retorno de /inscricoes, que é o Projeto com o status
                const ids = inscricoesRes.data.map(p => p.id); 
                setProjetosInscritosIds(ids);
            } else {
                setProjetosInscritosIds([]); 
            }

            if (Array.isArray(res.data)) {
                const projetosFormatados = res.data.map((p) => ({
                    id: p.id,
                    nome: p.nome,
                    descricao: p.descricao,
                    dataCriacao: p.dataCriacao,
                    empresaNome: p.empresaNome || p.empresa?.nome || "Não informado",
                    encerrado: p.encerrado || p.isEncerrado || false,
                    
                    tags: parseTagsString(p.tags),
                    
                    regime: p.regime || "N/I",
                    dataInicio: p.dataInicio, 
                    dataFim: p.dataFim,
                    
                    // 🚩 CRÍTICO: Mapeia o status retornado pelo backend
                    // Se estiver buscando inscrições, usa p.status (que deve vir do InscricaoProjetoResponse)
                    statusInscricao: isFetchingInscricoes ? p.status : undefined,
                }));

                console.log("Projetos carregados:", projetosFormatados);
                setProjetos(projetosFormatados);
            } else {
                setProjetos([]);
            }
        } catch (err) {
            console.error("Erro ao buscar projetos:", err.response?.data || err.message);
            setProjetos([]);
        }
    };

    // 🔹 Buscar projetos ao montar e quando role/token/modoAluno mudar
    useEffect(() => {
        fetchProjetos();
    }, [role, token, modoAluno]);

    // 🔹 Limpar o formulário (útil ao fechar/criar)
    const resetForm = () => {
        setNome("");
        setDescricao("");
        setTags([]);
        setRegime("PJ");
        setDataInicio("");
        setDataFim("");
    };

    // 🔹 Criar projeto
    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!nome || !descricao || !dataInicio || !dataFim || tags.length === 0) {
            return alert("Preencha todos os campos obrigatórios (Nome, Descrição, Datas e Tags).");
        }

        try {
            const res = await axios.post(
                `${baseURL}/criar`,
                { 
                    nome, 
                    descricao,
                    tags: tags.join(","), // Envia o array de tags como string separada por vírgula
                    regime,
                    dataInicio,
                    dataFim,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const novoProjeto = {
                id: res.data.id,
                nome: res.data.nome,
                descricao: res.data.descricao,
                dataCriacao: res.data.dataCriacao,
                empresaNome: res.data.empresaNome || res.data.empresa?.nome || "Não informado",
                encerrado: res.data.encerrado || false,
                
                tags: parseTagsString(res.data.tags),
                
                regime: res.data.regime,
                dataInicio: res.data.dataInicio,
                dataFim: res.data.dataFim,
            };

            setProjetos([...projetos, novoProjeto]);
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error("Erro ao criar projeto:", err.response?.data || err.message);
            alert("Erro ao criar projeto. Verifique se está logado como empresa.");
        }
    };
    
    // 🔹 Manipulador para Checkbox de Tags (Criação)
    const handleTagChange = (e) => {
        const value = e.target.value;
        const isChecked = e.target.checked;
        
        setTags(prevTags => {
            if (isChecked) {
                // Adiciona a tag se estiver marcada
                return [...prevTags, value];
            } else {
                // Remove a tag se estiver desmarcada
                return prevTags.filter(tag => tag !== value);
            }
        });
    };
    
    
    // 🔹 Encerrar projeto
    const handleEncerrarProjeto = async (id) => {
        if (!window.confirm("Tem certeza que deseja encerrar este projeto?")) return;

        try {
            await axios.post(
                `${baseURL}/${id}/encerrar`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProjetos(
                projetos.map((p) => (p.id === id ? { ...p, encerrado: true } : p))
            );
        } catch (err) {
            console.error("Erro ao encerrar projeto:", err.response?.data || err.message);
            alert("Você não tem permissão para encerrar este projeto.");
        }
    };

    // 🔹 Inscrever-se em projeto
    const handleInscrever = async (projetoId) => {
        if (!token) return alert("Você precisa estar logado para se inscrever!");
        
        try {
            await axios.post(
                `${baseURL}/${projetoId}/inscrever`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Inscrição no projeto ${projetoId} realizada com sucesso!`);
            
            // Atualiza o array de IDs para refletir a inscrição no modo TODOS
            setProjetosInscritosIds([...projetosInscritosIds, projetoId]);

        } catch (err) {
            const msg = err.response?.data || "Erro ao se inscrever. Tente novamente.";
            console.error("Erro ao se inscrever:", err.response?.data || err.message);
            alert(msg);
        }
    };

    // 🔹 Cancelar inscrição em projeto 
    const handleCancelRegistration = async (projetoId) => {
        if (!window.confirm("Tem certeza que deseja cancelar sua inscrição neste projeto?")) return;

        try {
            await axios.delete(
                `${baseURL}/${projetoId}/cancelar-inscricao`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Inscrição no projeto ${projetoId} cancelada com sucesso!`);
            
            // Remove o card se estiver no modo "Minhas Inscrições"
            setProjetos(projetos.filter(p => p.id !== projetoId));
            // Remove o ID da lista de inscritos
            setProjetosInscritosIds(prevIds => prevIds.filter(id => id !== projetoId));

        } catch (err) {
            const msg = err.response?.data || "Erro ao cancelar inscrição. Tente novamente.";
            console.error("Erro ao cancelar inscrição:", err.response?.data || err.message);
            alert(msg);
        }
    };

    // Função para gerar a classe CSS (corrigida)
    const generateTagClassName = (tag) => {
        // Caso especial para C++ para evitar falhas na regex do ambiente
        if (tag === "C++") {
            return "tag-c-plus-plus"; 
        }
        
        // Lógica para todas as outras tags (garantindo o alinhamento com o CSS)
        return `tag-${tag
            .replace(/\s/g, '-')
            .replace(/\+\+/g, 'plus-plus') // Corrigido o problema do escape na Regex
            .replace(/\#/g, 'sharp') // Trata o C#
            .replace(/\./g, '-') // Trata Vue.js, Node.js e Spring Boot
            .toLowerCase()
        }`;
    }

    // 🔹 LÓGICA DE ORDENAÇÃO (Mais Recente Primeiro)
    const projetosOrdenados = [...projetos].sort((a, b) => {
        // Converte as datas de criação para objetos Date para comparação
        const dateA = parseDate(a.dataCriacao);
        const dateB = parseDate(b.dataCriacao);

        // Trata datas inválidas ou nulas (coloca-as no final)
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Ordena em ordem decrescente (mais recente primeiro: B - A)
        return dateB.getTime() - dateA.getTime();
    });


    // 🔹 LÓGICA DE FILTRAGEM COMBINADA
    // Filtra a lista já ordenada
    const projetosFiltrados = projetosOrdenados.filter((p) => {
        // 1. Filtro de Texto (Nome ou Tag)
        const textoMin = filtroTexto.toLowerCase();
        const matchesTexto = 
            p.nome?.toLowerCase().includes(textoMin) ||
            p.tags?.some(tag => tag.toLowerCase().includes(textoMin));
            
        // 2. Filtro por Regime (PJ/CLT/TODOS)
        const matchesRegime = 
            filtroRegime === "TODOS" || 
            p.regime?.toUpperCase() === filtroRegime;
            
        // 3. Filtro por Tag Específica
        const matchesTag = 
            filtroTag === "TODAS" ||
            p.tags?.includes(filtroTag);
            
        // O projeto deve satisfazer TODAS as condições de filtro
        return matchesTexto && matchesRegime && matchesTag;
    });


    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <div className="projetos-container">
            <div className="top-bar">
                <h1 className="titulo-projetos">
                    {role === "ROLE_EMPRESA" 
                        ? "📁 Meus Projetos" 
                        : modoAluno === "INSCRITOS" ? "📋 Minhas Inscrições" : "📋 Projetos Disponíveis"
                    }
                </h1>
                <div className="actions">
                    {/* Botão de alternância para o ALUNO */}
                    {role === "ROLE_ALUNO" && (
                        <button
                            className={`meus-projetos-btn ${modoAluno === 'INSCRITOS' ? 'active' : ''}`}
                            onClick={() => setModoAluno((prev) => 
                                prev === "TODOS" ? "INSCRITOS" : "TODOS"
                            )}
                        >
                            {modoAluno === "TODOS" ? "Minhas Inscrições" : "Ver Todos"}
                        </button>
                    )}

                    {/* 🚩 NOVO BOTÃO: DASHBOARD CANDIDATOS (Apenas Empresa) */}
                    {role === "ROLE_EMPRESA" && (
                        <a 
                            href="/dashboard" // Assumindo que a rota do dashboard é /dashboard
                            className="btn-candidatos-dashboard" 
                        >
                            Candidatos
                        </a>
                    )}

                    {/* Botão Criar Projeto SÓ DEVE APARECER para a EMPRESA */}
                    {role === "ROLE_EMPRESA" && (
                        <button 
                            className="criar-projeto-btn" 
                            onClick={() => {setShowModal(true); resetForm();}}
                        >
                            + Criar Projeto
                        </button>
                    )}

                </div>
            </div>

            {/* 🚩 NOVA SEÇÃO DE FILTROS ABAIXO DO TOP BAR */}
            <div className="filter-controls-bar">
                <input
                    className="search-input"
                    placeholder="🔍 Buscar projeto ou tag..." 
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                />
                
                {/* Filtro de Regime */}
                <select
                    className="filter-select"
                    value={filtroRegime}
                    onChange={(e) => setFiltroRegime(e.target.value)}
                >
                    <option value="TODOS">Regime: Todos</option>
                    <option value="PJ">PJ</option>
                    <option value="CLT">CLT</option>
                </select>
                
                {/* Filtro de Tag Específica */}
                <select
                    className="filter-select"
                    value={filtroTag}
                    onChange={(e) => setFiltroTag(e.target.value)}
                >
                    <option value="TODAS">Tecnologia: Todas</option>
                    {LINGUAGENS_OPTIONS.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>

            <div className="lista-projetos-grid"> 
                {projetosFiltrados.length > 0 ? (
                    projetosFiltrados.map((p) => (
                        <div
                            key={p.id}
                            className={`project-card ${p.encerrado ? "encerrado" : ""}`}
                        >
                            <div className="project-header">
                                {/* 🚩 CORREÇÃO APLICADA: Adicionando a classe CSS para o gradiente */}
                                <h3 className="project-title-link">{p.nome}</h3>
                                <div className="status-tags">
                                    <span className={`status-regime regime-${p.regime?.toLowerCase()}`}>{p.regime}</span>
                                    {p.encerrado && <span className="status-tag encerrado">Encerrado</span>}
                                </div>
                            </div>
                            
                            <div className="card-info-group">
                                <span className="card-info">
                                    📅 Início: {p.dataInicio ? parseDate(p.dataInicio).toLocaleDateString("pt-BR") : "N/I"}
                                </span>
                                <span className="card-info">
                                    ⌛ Duração: {getDurationInMonths(p.dataInicio, p.dataFim)}
                                </span>
                            </div>
                            
                            {/* GERAÇÃO DE TAGS (USANDO FUNÇÃO CORRIGIDA) */}
                            <div className="tags-list">
                                {p.tags.map(tag => {
                                    const className = generateTagClassName(tag); 
                                    return (
                                        <span 
                                            key={tag} 
                                            className={`tag-chip ${className}`} 
                                        >
                                            {tag}
                                        </span>
                                    );
                                })}
                            </div>

                            <p className="descricao-completa">{p.descricao}</p> 

                            <div className="project-footer">
                                <span>Empresa: {p.empresaNome}</span>
                                <span>
                                    Criado em:{" "}
                                    {/* Usa parseDate para garantir que a data de criação seja formatada */}
                                    {p.dataCriacao ? parseDate(p.dataCriacao).toLocaleDateString("pt-BR") : "-"}
                                </span>
                                
                                {/* Lógica do Botão para ALUNO (Inscrever / Inscrito / Cancelar) */}
                                {!p.encerrado && role === "ROLE_ALUNO" && (
                                    <>
                                        {modoAluno === "INSCRITOS" ? (
                                            // 🚩 BLOCO CORRIGIDO PARA EXIBIR O STATUS DA INSCRIÇÃO
                                            <div className="status-and-action">
                                                {/* Correção: Garante que 'PENDENTE' é o fallback e usa .toLowerCase() */}
                                                <span className={`status-tag status-${(p.statusInscricao || 'PENDENTE').toLowerCase()}`}>
                                                    {p.statusInscricao || 'PENDENTE'}
                                                </span>
                                                
                                                {/* SÓ MOSTRA O BOTÃO DE CANCELAR SE ESTIVER PENDENTE */}
                                                {p.statusInscricao === 'PENDENTE' && (
                                                    <button
                                                        className="cancelar-inscricao-btn"
                                                        onClick={() => handleCancelRegistration(p.id)}
                                                    >
                                                        Cancelar Inscrição
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            // MODO TODOS: Botão Inscrever/Inscrito
                                            <button
                                                className={`inscrever-btn ${projetosInscritosIds.includes(p.id) ? 'inscrito' : ''}`}
                                                onClick={() => handleInscrever(p.id)}
                                                disabled={projetosInscritosIds.includes(p.id)}
                                            >
                                                {projetosInscritosIds.includes(p.id) ? 'Inscrito' : 'Inscrever-se'}
                                            </button>
                                        )}
                                    </>
                                )}

                                {!p.encerrado && role === "ROLE_EMPRESA" && (
                                    <button
                                        className="encerrar-btn"
                                        onClick={() => handleEncerrarProjeto(p.id)}
                                    >
                                        Encerrar Projeto
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="sem-projetos">Nenhum projeto encontrado</p>
                )}
            </div>

            {/* MODAL DE CRIAÇÃO */}
            {showModal && (
                <div className="modal-overlay" onClick={() => {setShowModal(false); resetForm();}}>
                    <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Novo Projeto</h2>
                        <form onSubmit={handleCreateProject} className="create-project-form">
                            
                            <input
                                placeholder="Nome do Projeto"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Descrição Completa do Projeto"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                rows="6"
                                required
                            />

                            <div className="form-row">
                                <label>
                                    Data de Início:
                                    <input 
                                        type="date" 
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    Data de Fim (Previsão):
                                    <input 
                                        type="date" 
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            <div className="form-regime">
                                <label>Regime de Contratação:</label>
                                <div className="radio-group-modal">
                                    <label>
                                        <input 
                                            type="radio" 
                                            value="PJ" 
                                            checked={regime === "PJ"}
                                            onChange={(e) => setRegime(e.target.value)}
                                        />
                                        Pessoa Jurídica (PJ)
                                    </label>
                                    <label>
                                        <input 
                                            type="radio" 
                                            value="CLT" 
                                            checked={regime === "CLT"}
                                            onChange={(e) => setRegime(e.target.value)}
                                        />
                                        CLT
                                    </label>
                                </div>
                            </div>

                            <div className="form-group-tags">
                                <label>Tags / Linguagens de Programação:</label>
                                {/* 🚩 SUBSTITUÍDO: Multi-Select por Checkboxes */}
                                <div className="tag-checkbox-group">
                                    {LINGUAGENS_OPTIONS.map(lang => (
                                        <label key={lang} className="tag-checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={lang}
                                                checked={tags.includes(lang)}
                                                onChange={handleTagChange}
                                                required={tags.length === 0}
                                            />
                                            {/* 🚩 USANDO FUNÇÃO CORRIGIDA AQUI */}
                                            <span className={`tag-chip ${generateTagClassName(lang)} checkbox-style`}>
                                                {lang}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <small>Selecione uma ou mais tecnologias.</small>
                            </div>
                            
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="cancelar-btn"
                                    onClick={() => {setShowModal(false); resetForm();}}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="salvar-btn">
                                    Criar Projeto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}