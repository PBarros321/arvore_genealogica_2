let dadosFamilia = []; // Variável para armazenar o JSON


// Função para transformar a lista plana (dadosFamilia) em um formato hierárquico
function buildHierarchy(data) {
    // 1. Criar um mapa de pessoas (id -> objeto) para acesso rápido
    const dataMap = data.reduce((map, node) => {
        map[node.id] = node;
        node.children = []; // Adiciona array de filhos
        return map;
    }, {});

    let treeData;

    // 2. Iterar sobre os dados para montar a hierarquia
    data.forEach(node => {
        const pai = dataMap[node.pai_id];
        const mae = dataMap[node.mae_id];
        
        // Simplesmente para o propósito de visualização, vamos considerar que o "nó pai" é o pai biológico
        if (pai && node.pai_id !== null) {
            if (!pai.children) {
                pai.children = [];
            }
            pai.children.push(node);
        } 
        
        // Encontrar a raiz (pessoas sem pai nem mãe na lista ou os mais antigos)
        if (node.pai_id === null && node.mae_id === null) {
            // Em uma árvore genealógica, a raiz é a pessoa mais antiga
            if (!treeData) {
                treeData = node;
            } else {
                // Se houver múltiplas raízes, você pode criar uma "raiz virtual"
                // Por simplicidade, vamos usar o primeiro encontrado
                // *AVISO: Isso pode precisar de ajuste dependendo da sua família.*
            }
        }
    });
    
    // Se a árvore não tiver uma raiz única (múltiplos galhos), o código acima precisará ser ajustado.
    // Para começar, certifique-se de que a pessoa mais antiga que você adicionou não tem pai/mãe preenchidos.
    return treeData; 
}

// Chamar esta função dentro do carregarDados()
async function carregarDados() {
    // ... (código para carregar dadosFamilia) ...

    const hierarchicalData = buildHierarchy(dadosFamilia);
    if (hierarchicalData) {
        desenharArvore(hierarchicalData);
    } else {
        console.error("Não foi possível construir a hierarquia. Verifique se há uma pessoa raiz (sem pai/mãe).");
    }
}


async function carregarDados() {
    try {
        const response = await fetch('dados.json');
        dadosFamilia = await response.json();
        console.log("Dados da família carregados:", dadosFamilia);
        // Chamar a função para desenhar a árvore aqui (Passo 3)
        desenharArvore(dadosFamilia); 
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}

function desenharArvore(rootData) {
    const container = d3.select("#arvore-container");
    const width = container.node().clientWidth;
    const height = 800; // Altura inicial

    // Define o layout de árvore do D3.js
    const treeLayout = d3.tree()
        .size([width, height - 100]); // Ajuste para caber na tela

    // Cria o SVG (onde o gráfico será desenhado)
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        // Adiciona um grupo <g> para aplicar transformações (como pan/zoom)
        .append("g")
        .attr("transform", "translate(0, 50)"); // Move a árvore um pouco para baixo

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
        .attr("d", d3.linkVertical() // Desenha linhas verticais
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
        .on('click', (event, d) => showDetails(d.data)); // Chamada para a função de detalhes

    // Você precisará de um CSS para os nós e links (em style.css)
    
    // **Implementação de Pan e Zoom (Opcional)**
    // Adiciona a funcionalidade de zoom e pan ao SVG inteiro
    // const zoom = d3.zoom()
    //     .on('zoom', (event) => {
    //         svg.attr('transform', event.transform);
    //     });
    // d3.select("#arvore-container svg").call(zoom);
}

// Função placeholder para mostrar os detalhes (Substitua por um Modal/Popup)
function showDetails(personData) {
    alert(`Detalhes de: ${personData.nome}\nNascimento: ${personData.nascimento}\nID: ${personData.id}`);
    // Aqui você deve criar e mostrar um elemento HTML (modal) com a foto e os dados.
}

carregarDados();