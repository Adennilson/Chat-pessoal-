const API_KEY = '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'; 

const campoMensagens = document.getElementById('mensagens');
const entrada = document.getElementById('entradaUsuario');
const botao = document.getElementById('btnEnviar');
const btnLimpar = document.getElementById('btnLimpar');

let historico = JSON.parse(localStorage.getItem('chat_lunna')) || [
    { 
        role: "system", 
        content: `Você é a Lunna, assistente treinada por Adenilson. 
        - Use SEMPRE listas e **negrito**.
        - Seja organizada e use quebras de linha.` 
    }
];

window.onload = () => {
    historico.forEach(msg => {
        if (msg.role !== 'system') renderizarMensagem(msg.content, msg.role === 'user' ? 'user' : 'ia');
    });
};

function renderizarMensagem(texto, tipo) {
    const div = document.createElement('div');
    div.classList.add('msg', tipo);
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const conteudo = (tipo === 'ia') ? marked.parse(texto) : texto;
    div.innerHTML = `<div>${conteudo}</div><span class="time">${hora}</span>`;
    
    campoMensagens.appendChild(div);
    
    // Scroll inteligente: Usuário vai pro fim, IA mostra o início
    if (tipo === 'user') {
        campoMensagens.scrollTop = campoMensagens.scrollHeight;
    } else {
        div.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

async function chamarIA() {
    const msg = entrada.value.trim();
    if (!msg) return;

    renderizarMensagem(msg, 'user');
    historico.push({ role: "user", content: msg });
    localStorage.setItem('chat_lunna', JSON.stringify(historico));
    
    entrada.value = '';
    botao.disabled = true;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`},
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: historico })
        });

        const data = await response.json();
        const resposta = data.choices[0].message.content;

        renderizarMensagem(resposta, 'ia');
        historico.push({ role: "assistant", content: resposta });
        localStorage.setItem('chat_lunna', JSON.stringify(historico));

    } catch (e) {
        renderizarMensagem("Erro de conexão 🤖", 'ia');
    } finally {
        botao.disabled = false;
    }
}

// FUNÇÃO DE LIMPAR CHAT
btnLimpar.onclick = () => {
    if(confirm("Deseja apagar o histórico?")) {
        localStorage.removeItem('chat_lunna');
        location.reload();
    }
};

botao.onclick = chamarIA;
entrada.onkeypress = (e) => { if (e.key === 'Enter') chamarIA(); };
