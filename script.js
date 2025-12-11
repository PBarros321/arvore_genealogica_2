// 1. Variável de dados global
let dadosFamilia = [];

// 2. FUNÇÃO DE CONSTRUÇÃO DE HIERARQUIA (COM SUPER-RAIZ PARA MÚLTIPLOS ANCESTRAIS)
function buildHierarchy(data) {
    // 1. Criar o mapa de pessoas (id -> objeto) para acesso rápido e garantir a estrutura children
    const dataMap = data.reduce((map, node) => {
        // Clonar o objeto para evitar modificar o array de dados original
        map[node.id] = { ...node, children: [] }; 
        return map;
    }, {});

    let roots = []; // Para armazenar todos os nós que são raízes (sem pai/mãe)

    // 2. Iterar sobre os dados para montar a hierarquia
    data.forEach(node => {
        const fullNode = dataMap[node.id];
        const paiNode = dataMap[node.pai_id];
        
        if (paiNode) {
            paiNode.children.push(fullNode);
        } else if (node.pai_id === null && node.mae_id === null) {
            // Se não tem pai nem mãe, é uma raiz
            roots.push(fullNode);
        }
    });

    // 3. Criar uma "Super-Raiz" Virtual se houver mais de uma raiz (seus avós)
    if (roots.length > 1) {
        const superRoot = {
            id: 0, 
            nome: "Tronco Familiar Principal",
            children: roots 
        };
        return superRoot;
    } else if (roots.length === 1) {
        return roots[0];
    } else {
        return null; 
    }
}

// 3. FUNÇÃO PRINCIPAL DE CARREGAMENTO (Consolidada)
async function carregarDados() {
    try {
        const response = await fetch('dados.json');
        dadosFamilia = await response.json();
        console.log("Dados da família carregados:", dadosFamilia);

        // 🟢 PASSO CRÍTICO: Transforma o array plano em hierarquia
        const hierarchicalData = buildHierarchy(dadosFamilia);
        
        if (hierarchicalData) {
            console.log("Estrutura D3 pronta. Desenhando a árvore...");
            desenharArvore(hierarchicalData); // <-- Passa os dados HIERÁRQUICOS
        } else {
            console.error("Não foi possível construir a hierarquia. Verifique se há uma pessoa raiz.");
        }
        
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}

// 4. FUNÇÃO DE DESENHO DA ÁRVORE (D3.js) - Não alterada
function desenharArvore(rootData) {
    const container = d3.select("#arvore-container");
    
    // Verifique se o container existe e tem largura, caso contrário, use um valor padrão
    const width = container.node() ? container.node().clientWidth : 960;
    const height = 800; // Altura inicial

    // Define o layout de árvore do D3.js
    const treeLayout = d3.tree()
        .size([width, height - 100]); 

    // Cria o SVG (onde o gráfico será desenhado)
    // Primeiro limpa qualquer SVG antigo que possa ter sido criado
    container.select("svg").remove(); 
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0, 50)"); 

    // Converte os dados brutos da raiz (rootData) em um formato de nós D3
    const root = d3.hierarchy(rootData);
    const nodes = treeLayout(root);

    // 1. Desenhar as Linhas (Links)
    svg.selectAll(".link")
        .data(nodes.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("d", d3.linkVertical() 
            .x(d => d.x)
            .y(d => d.y)
        );

    // 2. Desenhar os Nós (Pessoas)
    const node = svg.selectAll(".node")
        .data(nodes.descendants())
        .enter().append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Adicionar Círculos ou Caixas
    node.append("circle")
        .attr("r", 10)
        .attr("fill", "steelblue")
        .attr("stroke", "white");

    // Adicionar o Nome
    node.append("text")
        .attr("dy", "0.31em")
        .attr("y", d => d.children ? -20 : 20)
        .attr("text-anchor", "middle")
        .text(d => d.data.nome)
        // Adicionar o evento de clique para mostrar detalhes
        .on('click', (event, d) => showDetails(d.data)); 
}

// 5. FUNÇÃO DE DETALHES E PWA (Não alterada)
function showDetails(personData) {
    alert(`Detalhes de: ${personData.nome}\nNascimento: ${personData.nascimento}\nID: ${personData.id}`);
}

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Use o caminho específico que você confirmou que funciona para o 404
        navigator.serviceWorker.register('/arvore_genealogica_2/service-worker.js') 
            .then(reg => console.log('Service Worker Registrado!', reg))
            .catch(err => console.log('Erro no Service Worker:', err));
    });
}

// 6. INÍCIO DA APLICAÇÃO
carregarDados();