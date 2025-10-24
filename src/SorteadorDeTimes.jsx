import React, { useState, useEffect } from 'react';

// Função para detectar a cor a partir do nome do time
const detectarCor = (nome) => {
    if (!nome) return null;
    const n = nome.toLowerCase();
    if (n.includes("vermelho")) return "team-vermelho";
    if (n.includes("azul")) return "team-azul";
    if (n.includes("verde")) return "team-verde";
    if (n.includes("amarelo")) return "team-amarelo";
    if (n.includes("laranja")) return "team-laranja";
    if (n.includes("roxo")) return "team-roxo";
    if (n.includes("rosa")) return "team-rosa";
    if (n.includes("preto")) return "team-preto";
    if (n.includes("branco")) return "team-branco";
    if (n.includes("cinza")) return "team-cinza";
    if (n.includes("marrom")) return "team-marrom";
    return null;
};

import './SorteadorDeTimes.css';

const LOCAL_STORAGE_KEY = 'listaJogadoresPelada';
const gerarId = () => Date.now();

// Base URL da API (usa env var no Vercel, localhost em dev)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function SorteadorDeTimes() {
    // ESTADOS
    const [jogadores, setJogadores] = useState([]);
    const [novoNome, setNovoNome] = useState('');
    const [novoNivel, setNovoNivel] = useState(1); 
    const [tamanhoTime, setTamanhoTime] = useState(5); 
    const [timesSorteados, setTimesSorteados] = useState(null);
    const [jogadoresReserva, setJogadoresReserva] = useState([]);
    const [nomesTimes, setNomesTimes] = useState({});
    
    // ESTADOS DE AUTENTICAÇÃO
    const [usuario, setUsuario] = useState(null);
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const [emailLogin, setEmailLogin] = useState('');
    const [senhaLogin, setSenhaLogin] = useState('');
    const [erroLogin, setErroLogin] = useState('');
    const [carregando, setCarregando] = useState(false);

    // --- 1. PERSISTÊNCIA DE DADOS (LocalStorage ou API) ---

    // Efeito para CARREGAR os dados quando o componente é montado
    useEffect(() => {
        // Verifica se tem usuário salvo no localStorage
        const savedUser = localStorage.getItem('usuario');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setUsuario(user);
            } catch (e) {
                console.error("Erro ao carregar usuário:", e);
                localStorage.removeItem('usuario');
            }
        } else {
            // Carrega do localStorage se não estiver logado
            const storedJogadores = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedJogadores) {
                try {
                    setJogadores(JSON.parse(storedJogadores));
                } catch (e) {
                    console.error("Erro ao carregar jogadores do LocalStorage:", e);
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                }
            }
        }
    }, []);

    // Efeito para carregar jogadores do banco quando logar
    useEffect(() => {
        if (usuario && usuario.userId) {
            carregarJogadores();
        }
    }, [usuario]);

    // Efeito para SALVAR os dados no localStorage se não estiver logado
    useEffect(() => {
        if (!usuario) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jogadores));
        }
    }, [jogadores, usuario]);

    // --- 2. FUNÇÕES DE API ---

    // Função auxiliar para fazer requisições autenticadas
    const fetchWithAuth = async (url, options = {}) => {
        if (!usuario || !usuario.token) {
            throw new Error('Usuário não autenticado');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${usuario.token}`,
            ...options.headers
        };

        const response = await fetch(url, { ...options, headers });

        // Verifica se o token expirou
        if (response.status === 401) {
            fazerLogout();
            alert('Sessão expirada. Faça login novamente.');
        }

        return response;
    };

    const fazerLogout = () => {
        setUsuario(null);
        localStorage.removeItem('usuario');
        setJogadores([]);
    };

    const carregarJogadores = async () => {
        if (!usuario) return;
        
        try {
            const response = await fetchWithAuth(`${API_BASE}/players/${usuario.userId}`);
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                console.error('Erro na resposta da API:', response.status, response.statusText);
                alert(`Erro ao carregar jogadores: ${response.status} ${response.statusText}`);
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Converte do formato do banco para o formato local (carrega TODOS, não filtra)
                const jogadoresBanco = data.players.map(p => ({
                    id: p.id,
                    nome: p.name,
                    nivel: p.level,
                    presente: p.present,
                    fromDB: true
                }));
                setJogadores(jogadoresBanco);
                console.log(`✅ ${jogadoresBanco.length} jogadores carregados com sucesso`);
            } else {
                console.error('API retornou success: false', data);
                alert('Erro ao carregar jogadores: ' + (data.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
            alert('Erro ao conectar com o servidor para carregar jogadores. Verifique sua conexão.');
        }
    };

    const fazerLogin = async (e) => {
        e.preventDefault();
        setErroLogin('');
        setCarregando(true);

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailLogin, password: senhaLogin })
            });

            const data = await response.json();

            if (data.success) {
                const userData = { userId: data.userId, email: data.email, token: data.token };
                setUsuario(userData);
                localStorage.setItem('usuario', JSON.stringify(userData));
                setMostrarLogin(false);
                setEmailLogin('');
                setSenhaLogin('');
            } else {
                setErroLogin(data.message || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setErroLogin('Erro ao conectar com o servidor');
        } finally {
            setCarregando(false);
        }
    };

    // --- 3. FUNÇÕES DE GESTÃO DE JOGADORES ---

    const adicionarJogador = async () => {
        if (novoNome.trim() === '') return;

        if (usuario) {
            // Se logado, adiciona no banco
            try {
                const response = await fetchWithAuth(`${API_BASE}/players`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: novoNome.trim(),
                        level: parseInt(novoNivel) || 3
                    })
                });

                const data = await response.json();

                if (data.success) {
                    const novoJogador = {
                        id: data.player.id,
                        nome: data.player.name,
                        nivel: data.player.level,
                        presente: data.player.present,
                        fromDB: true
                    };
                    setJogadores([...jogadores, novoJogador]);
                    setNovoNome('');
                    setNovoNivel(1);
                }
            } catch (error) {
                console.error('Erro ao adicionar jogador:', error);
                alert('Erro ao adicionar jogador');
            }
        } else {
            // Se não logado, adiciona no localStorage
            const novoJogador = { 
                id: gerarId(), 
                nome: novoNome.trim(), 
                nivel: parseInt(novoNivel) || 3,
                presente: true
            };

            setJogadores([...jogadores, novoJogador]);
            setNovoNome('');
            setNovoNivel(1); 
        }
    };

    const marcarAusente = async (id) => {
        if (!usuario) return;

        try {
            const response = await fetchWithAuth(`${API_BASE}/players/update/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ present: false })
            });

            const data = await response.json();

            if (data.success) {
                // Atualiza o estado do jogador sem removê-lo da lista
                setJogadores(jogadores.map(j => 
                    j.id === id ? { ...j, presente: false } : j
                ));
                setTimesSorteados(null);
            }
        } catch (error) {
            console.error('Erro ao marcar ausente:', error);
            alert('Erro ao marcar ausente');
        }
    };

    const marcarPresente = async (id) => {
        if (!usuario) return;

        try {
            const response = await fetchWithAuth(`${API_BASE}/players/update/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ present: true })
            });

            const data = await response.json();

            if (data.success) {
                // Atualiza o estado do jogador para presente
                setJogadores(jogadores.map(j => 
                    j.id === id ? { ...j, presente: true } : j
                ));
                setTimesSorteados(null);
            }
        } catch (error) {
            console.error('Erro ao marcar presente:', error);
            alert('Erro ao marcar presente');
        }
    };

    const deletarJogador = async (id) => {
        if (!usuario) return;

        if (!confirm('Deseja realmente deletar este jogador permanentemente?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_BASE}/players/update/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setJogadores(jogadores.filter(j => j.id !== id));
                setTimesSorteados(null);
            }
        } catch (error) {
            console.error('Erro ao deletar jogador:', error);
            alert('Erro ao deletar jogador');
        }
    };

    const removerJogador = (id) => {
        setJogadores(jogadores.filter(j => j.id !== id));
        setTimesSorteados(null);
    };

    const atualizarNivel = (id, novoNivelValor) => {
        const nivel = parseInt(novoNivelValor);
        if (isNaN(nivel) || nivel < 1 || nivel > 5) return;

        setJogadores(jogadores.map(j => 
            j.id === id ? { ...j, nivel: nivel } : j
        ));
        setTimesSorteados(null); 
    };

    // --- 4. ALGORITMO DE BALANCEAMENTO (Método da Serpente) ---

    const sortearTimes = () => {
        if (!tamanhoTime || isNaN(tamanhoTime) || tamanhoTime <= 0) {
            alert("Defina um número válido de jogadores por time!");
            return;
        }
        // Filtra apenas jogadores presentes para o sorteio
        const jogadoresPresentes = jogadores.filter(j => j.presente !== false);
        const jogadoresAtivos = jogadoresPresentes.length;
        const numTimes = (tamanhoTime && tamanhoTime > 0) ? Math.floor(jogadoresAtivos / tamanhoTime) : 0;
        const jogadoresNecessarios = tamanhoTime * numTimes;

        if (jogadoresAtivos < tamanhoTime) {
            alert(`Você precisa de pelo menos ${tamanhoTime} jogadores PRESENTES para formar 1 time.`);
            setTimesSorteados(null);
            setJogadoresReserva([]);
            return;
        }

        // 1. CÓPIA E ORDENAÇÃO: Ordena do melhor para o pior (apenas presentes)
        const jogadoresOrdenados = [...jogadoresPresentes]
            .sort((a, b) => b.nivel - a.nivel);
        
        // Separa os jogadores que vão jogar dos que ficam de reserva
        const jogadoresSorteados = jogadoresOrdenados.slice(0, jogadoresNecessarios);
        const reservas = jogadoresOrdenados.slice(jogadoresNecessarios);

        // Inicializa a estrutura de times
        const times = Array(numTimes).fill(0).map((_, i) => ({
            nome: nomesTimes[i] || `Time ${i + 1}`,
            jogadores: [],
            nivelTotal: 0
        }));

        // 2. DISTRIBUIÇÃO EM ZIG-ZAG
        let direcao = 1; 
        let indiceTime = 0;

        jogadoresSorteados.forEach((jogador) => {
            times[indiceTime].jogadores.push(jogador);
            times[indiceTime].nivelTotal += jogador.nivel;

            indiceTime += direcao;

            if (indiceTime >= numTimes) {
                indiceTime = numTimes - 1;
                direcao = -1;
            } 
            else if (indiceTime < 0) {
                indiceTime = 0;
                direcao = 1;
            }
        });

        setTimesSorteados(times);
        setJogadoresReserva(reservas);
    };

    const renderStars = (nivel, onClick = null, editable = true) => {
        return (
            <div className="stars-container">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= nivel ? 'filled' : ''} ${!editable ? 'readonly' : ''}`}
                        onClick={() => editable && onClick && onClick(star)}
                        style={{ cursor: editable ? 'pointer' : 'default' }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const copiarResultado = () => {
        if (!timesSorteados) return;
        
        let texto = '';
        timesSorteados.forEach((time, index) => {
            texto += `*${time.nome}*\n`;
            time.jogadores.forEach(j => {
                texto += `${j.nome}\n`;
            });
            if (index < timesSorteados.length - 1) texto += '\n';
        });
        
        // Adiciona os jogadores reserva se houver
        if (jogadoresReserva.length > 0) {
            texto += '\n*Reserva*\n';
            jogadoresReserva.forEach(j => {
                texto += `${j.nome}\n`;
            });
        }
        
        navigator.clipboard.writeText(texto).then(() => {
            alert('Resultado copiado!');
        }).catch(() => {
            alert('Erro ao copiar');
        });
    };

    // --- 5. RENDERIZAÇÃO DA INTERFACE (JSX) ---

    return (
        <div className="container">
            {/* BOTÃO DE LOGIN NO CANTO SUPERIOR DIREITO */}
            <div className="login-container">
                {usuario ? (
                    <button onClick={fazerLogout} className="logout-btn">Sair</button>
                ) : (
                    <button onClick={() => setMostrarLogin(true)} className="login-btn">Login</button>
                )}
            </div>

            <h1>Sorteador Inteligente de Pelada</h1>
            <hr />

            {/* MODAL DE LOGIN */}
            {mostrarLogin && (
                <div className="modal-overlay" onClick={() => setMostrarLogin(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Login</h2>
                        <form onSubmit={fazerLogin}>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={emailLogin}
                                    onChange={(e) => setEmailLogin(e.target.value)}
                                    required
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Senha:</label>
                                <input
                                    type="password"
                                    value={senhaLogin}
                                    onChange={(e) => setSenhaLogin(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            {erroLogin && <p className="erro-login">{erroLogin}</p>}
                            <div className="modal-buttons">
                                <button type="submit" disabled={carregando}>
                                    {carregando ? 'Entrando...' : 'Entrar'}
                                </button>
                                <button type="button" onClick={() => setMostrarLogin(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONTROLE DO TAMANHO DO TIME */}
            <div className="input-group">
                <label>
                    Jogadores por Time: 
                    <input 
                        type="number" 
                        min="2"
                        value={tamanhoTime} 
                        onChange={(e) => {
                            const valor = e.target.value;
                            setTamanhoTime(valor === '' ? '' : parseInt(valor) || '');
                        }}
                        onBlur={(e) => {
                            const valor = e.target.value;
                            if (valor === '' || parseInt(valor) < 2) {
                                setTamanhoTime(2);
                            }
                        }}
                    />
                </label>
            </div>

            {/* SEÇÃO DE CADASTRO */}
            <h2>1. Cadastrar Jogador</h2>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Nome do Jogador"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarJogador()}
                />
                <div className="star-selector">
                    <label>Nível:</label>
                    {renderStars(novoNivel, setNovoNivel)}
                </div>
                <button onClick={adicionarJogador}>Adicionar</button>
            </div>

            {/* LISTA DE JOGADORES */}
            <h2>2. Lista de Jogadores Cadastrados</h2>
            {jogadores.length > 0 && (
                <div className="counter-badge">
                    <span className="counter-number">{jogadores.filter(j => j.presente !== false).length}</span>
                    <span className="counter-text">jogador{jogadores.filter(j => j.presente !== false).length !== 1 ? 'es' : ''} presente{jogadores.filter(j => j.presente !== false).length !== 1 ? 's' : ''}</span>
                </div>
            )}
            <ul className="player-list">
                {jogadores.map(j => (
                    <li key={j.id} className={`player-item ${j.presente === false ? 'player-ausente' : ''}`}>
                        <span>{j.nome}</span>
                        <div className="level-control">
                            <label>Nível:</label>
                            {renderStars(j.nivel, null, false)}
                            {usuario && j.fromDB ? (
                                <>
                                    {j.presente === false ? (
                                        <button onClick={() => marcarPresente(j.id)} className="present-btn" title="Marcar presente">
                                            ✅
                                        </button>
                                    ) : (
                                        <button onClick={() => marcarAusente(j.id)} className="absent-btn" title="Marcar ausente">
                                            X
                                        </button>
                                    )}
                                    <button onClick={() => deletarJogador(j.id)} className="delete-btn" title="Deletar permanentemente">
                                        🗑️
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => removerJogador(j.id)} className="remove-btn">
                                    X
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <hr />

            {/* BOTÃO DE SORTEIO */}
            <h2>3. Sortear</h2>
            {(() => {
                const jogadoresPresentes = jogadores.filter(j => j.presente !== false);
                const numTimesPossiveis = (tamanhoTime && tamanhoTime > 0) ? Math.floor(jogadoresPresentes.length / tamanhoTime) : 0;
                return numTimesPossiveis > 0 && (
                    <>
                        <div className="team-names-section">
                            {Array.from({ length: numTimesPossiveis }, (_, i) => (
                                <div key={i} className="team-name-input">
                                    <label>Nome do Time {i + 1}:</label>
                                    <input
                                        type="text"
                                        placeholder={`Time ${i + 1}`}
                                        value={nomesTimes[i] || ''}
                                        onChange={(e) => setNomesTimes({ ...nomesTimes, [i]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="teams-info">
                            Serão formados <strong>{numTimesPossiveis} times</strong> com {tamanhoTime} jogadores cada.
                            {jogadoresPresentes.length % tamanhoTime > 0 && ` (${jogadoresPresentes.length % tamanhoTime} jogador${jogadoresPresentes.length % tamanhoTime > 1 ? 'es' : ''} ficará${jogadoresPresentes.length % tamanhoTime > 1 ? 'ão' : ''} de fora)`}
                        </p>
                    </>
                );
            })()}
            <button 
                onClick={sortearTimes} 
                disabled={jogadores.filter(j => j.presente !== false).length < tamanhoTime}
                className="sort-button"
            >
                Sortear Times de {tamanhoTime}
            </button>
            {jogadores.filter(j => j.presente !== false).length < tamanhoTime && (
                <p className="warning">Mínimo de {tamanhoTime} jogadores PRESENTES para sortear.</p>
            )}

            {/* RESULTADO DO SORTEIO */}
            {timesSorteados && (
                <div className="result-box">
                    <div className="result-header">
                        <h2>Resultado do Sorteio</h2>
                        <button onClick={copiarResultado} className="copy-button" title="Copiar resultado">
                            📋
                        </button>
                    </div>
                    {timesSorteados.map((time, index) => (
                        <div key={index} className="team-result">
                            <h3 className={`team-name ${detectarCor(time.nome) || `team-${index + 1}`}`}>
                                {time.nome}
                            </h3>
                            <ul>
                                {time.jogadores.map(j => (
                                    <li key={j.id}>
                                        <span className="player-name-result">{j.nome}</span>
                                        {renderStars(j.nivel, null, false)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    
                    {/* SEÇÃO DE RESERVAS */}
                    {jogadoresReserva.length > 0 && (
                        <div className="team-result">
                            <h3 className="team-name team-reserva">
                                Reserva
                            </h3>
                            <ul>
                                {jogadoresReserva.map(j => (
                                    <li key={j.id}>
                                        <span className="player-name-result">{j.nome}</span>
                                        {renderStars(j.nivel, null, false)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <p className="footer-note">* Times balanceados pelo Algoritmo da Serpente.</p>
                </div>
            )}
        </div>
    );
}

export default SorteadorDeTimes;
