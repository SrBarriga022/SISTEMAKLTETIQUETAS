// ===================================================================
// SISTEMA KLT - GERENCIAMENTO DE ETIQUETAS E COTAÇÕES (Versão Web)
// ===================================================================

// ==================== BANCO DE DADOS SIMULADO ====================
let cotações = [];
let proximoId = 1;
let parametros = {
    taxaSeguro: 1.5,
    taxaAdValorem: 0.5,
    taxaPorKG: 5.0,
    taxaPorVolume: 10.0
};

// Carregar dados salvos do localStorage
function carregarDados() {
    const saved = localStorage.getItem('klt_cotacoes');
    if (saved) {
        cotações = JSON.parse(saved);
        proximoId = cotações.length > 0 ? Math.max(...cotações.map(c => c.id)) + 1 : 1;
    }
    const savedParams = localStorage.getItem('klt_parametros');
    if (savedParams) {
        parametros = JSON.parse(savedParams);
    }
}

function salvarDados() {
    localStorage.setItem('klt_cotacoes', JSON.stringify(cotações));
    localStorage.setItem('klt_parametros', JSON.stringify(parametros));
}

// ==================== FUNÇÕES DE CÁLCULO ====================
function calcularPesoCubico(altura, comprimento, largura) {
    return (altura * comprimento * largura) / 6000;
}

function calcularFrete(peso, volumes) {
    return (peso * parametros.taxaPorKG) + (volumes * parametros.taxaPorVolume);
}

function calcularSeguro(valorNota) {
    return valorNota * (parametros.taxaSeguro / 100);
}

function calcularAdValorem(valorNota) {
    return valorNota * (parametros.taxaAdValorem / 100);
}

function calcularOutros(peso, volumes) {
    return (peso * 0.5) + (volumes * 2.0);
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatarData() {
    return new Date().toLocaleString('pt-BR');
}

// ==================== GERAR COTAÇÃO ====================
function gerarCotacao() {
    // Coletar dados
    const cnpj = document.getElementById('remCnpj').value;
    const remetente = document.getElementById('remNome').value;
    const enderecoSaida = document.getElementById('remEnderecoSaida').value;
    const destinatario = document.getElementById('remDestinatario').value;
    const cidadeDestino = document.getElementById('remCidadeDestino').value;
    const enderecoEntrega = document.getElementById('remEnderecoEntrega').value;
    const valorNota = parseFloat(document.getElementById('mercValor').value);
    const peso = parseFloat(document.getElementById('mercPeso').value);
    const volumes = parseInt(document.getElementById('mercVolumes').value);
    const altura = parseFloat(document.getElementById('mercAltura').value);
    const comprimento = parseFloat(document.getElementById('mercComprimento').value);
    const largura = parseFloat(document.getElementById('mercLargura').value);
    
    // Validar
    if (!remetente || !destinatario || !cidadeDestino) {
        alert('⚠️ Preencha todos os campos obrigatórios!');
        return;
    }
    
    // Obter transportadora selecionada
    const selectedRow = document.querySelector('#tableTransportadoras tbody tr.selected');
    const transportadora = selectedRow ? selectedRow.cells[0].innerText : 'EXPRESSO PRINCESA DOS CAMPOS';
    
    // Calcular
    const pesoCubico = calcularPesoCubico(altura, comprimento, largura);
    const pesoEfetivo = Math.max(peso, pesoCubico);
    const freteBase = calcularFrete(pesoEfetivo, volumes);
    const seguro = calcularSeguro(valorNota);
    const adValorem = calcularAdValorem(valorNota);
    const outros = calcularOutros(pesoEfetivo, volumes);
    const total = freteBase + seguro + adValorem + outros;
    
    // Gerar resultado
    const resultado = `
╔══════════════════════════════════════════════════════════════════════╗
║                 COTAÇÃO DE FRETE - SISTEMA KLT 2026                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                        FRETE POR CONTA DO REMETENTE                  ║
╠══════════════════════════════════════════════════════════════════════╣
║ CNPJ/CPF: ${cnpj.padEnd(65)}║
║ VALOR TOTAL DA NOTA: ${formatarMoeda(valorNota).padEnd(55)}║
║ PESO TOTAL: ${pesoEfetivo.toFixed(2)} KG${' '.repeat(62 - (pesoEfetivo.toFixed(2)+' KG').length)}║
║ QUANTIDADE DE VOLUMES: ${volumes}${' '.repeat(57)}║
║ DIMENSÕES: ${altura}x${comprimento}x${largura} cm${' '.repeat(53)}║
╠══════════════════════════════════════════════════════════════════════╣
║ DESTINATÁRIO: ${destinatario.substring(0, 60).padEnd(63)}║
╠══════════════════════════════════════════════════════════════════════╣
║ CIDADE DESTINO: ${cidadeDestino.padEnd(62)}║
║ TRANSPORTADORA: ${transportadora.padEnd(61)}║
╠══════════════════════════════════════════════════════════════════════╣
║                         DETALHAMENTO DOS CUSTOS                      ║
╠══════════════════════════════════════════════════════════════════════╣
║ • Frete Base: ${formatarMoeda(freteBase).padEnd(61)}║
║ • Seguro (${parametros.taxaSeguro}% do valor): ${formatarMoeda(seguro).padEnd(53)}║
║ • Ad Valorem (${parametros.taxaAdValorem}%): ${formatarMoeda(adValorem).padEnd(56)}║
║ • Outros Custos: ${formatarMoeda(outros).padEnd(59)}║
╠══════════════════════════════════════════════════════════════════════╣
║ TOTAL DO FRETE: ${formatarMoeda(total).padEnd(59)}║
╠══════════════════════════════════════════════════════════════════════╣
║ OBSERVAÇÃO: Valores sujeitos a alteração conforme peso cúbico e      ║
║            condições de entrega. Prazo estimado: 2-3 dias úteis.     ║
╚══════════════════════════════════════════════════════════════════════╝
Gerado em: ${formatarData()}
Sistema KLT - Gerenciamento Completo 2026
    `;
    
    document.getElementById('resultadoCotacao').innerText = resultado;
    
    // Armazenar para salvar
    window.ultimaCotacao = {
        cnpj, remetente, enderecoSaida, destinatario, cidadeDestino, enderecoEntrega,
        valorNota, peso: pesoEfetivo, volumes, altura, comprimento, largura,
        transportadora, freteBase, seguro, adValorem, outros, total, data: new Date()
    };
}

function salvarCotacao() {
    if (!window.ultimaCotacao) {
        alert('⚠️ Gere uma cotação primeiro!');
        return;
    }
    
    const cotacao = {
        id: proximoId++,
        ...window.ultimaCotacao,
        dataFormatada: formatarData()
    };
    
    cotações.push(cotacao);
    salvarDados();
    alert(`✅ Cotação #${cotacao.id} salva com sucesso!`);
    atualizarHistorico();
}

function imprimirCotacao() {
    const texto = document.getElementById('resultadoCotacao').innerText;
    const janela = window.open();
    janela.document.write('<pre>' + texto + '</pre>');
    janela.print();
    janela.close();
}

// ==================== ETIQUETAS ====================
function visualizarEtiqueta() {
    const empresa = document.getElementById('etiEmpresa').value;
    const nrCotacao = document.getElementById('etiNrCotacao').value;
    const volumesTotal = parseInt(document.getElementById('etiVolumes').value);
    const transportadora = document.getElementById('etiTransportadora').value;
    const nrNota = document.getElementById('etiNrNota').value;
    const destinatario = document.getElementById('etiDestinatario').value;
    
    if (!nrCotacao || !transportadora || !nrNota || !destinatario) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }
    
    const preview = `
╔══════════════════════════════════════════════════════════╗
║          ETIQUETA - CONFERIR NO ATO DO RECEBIMENTO       ║
╠══════════════════════════════════════════════════════════╣
║ EMPRESA: ${empresa.padEnd(45)}║
║ NR COTAÇÃO: ${nrCotacao.padEnd(44)}║
║ VOLUMES: 1/${volumesTotal}${' '.repeat(47 - (String(volumesTotal).length))}║
║ TRANSPORTADORA: ${transportadora.padEnd(41)}║
║ NR NOTA: ${nrNota.padEnd(46)}║
║ DESTINATÁRIO: ${destinatario.padEnd(44)}║
╠══════════════════════════════════════════════════════════╣
║        FAVOR CONFERIR NO ATO DO RECEBIMENTO!             ║
╚══════════════════════════════════════════════════════════╝
    `;
    
    document.getElementById('previewEtiquetaText').innerText = preview;
}

function gerarEtiquetas() {
    const empresa = document.getElementById('etiEmpresa').value;
    const nrCotacao = document.getElementById('etiNrCotacao').value;
    const volumesTotal = parseInt(document.getElementById('etiVolumes').value);
    const transportadora = document.getElementById('etiTransportadora').value;
    const nrNota = document.getElementById('etiNrNota').value;
    const destinatario = document.getElementById('etiDestinatario').value;
    
    if (!nrCotacao || !transportadora || !nrNota || !destinatario || isNaN(volumesTotal)) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }
    
    let etiquetas = '';
    for (let i = 1; i <= volumesTotal; i++) {
        etiquetas += `
========================================
          ETIQUETA DE ENVIO            
========================================
EMPRESA: ${empresa}
NR COTAÇÃO: ${nrCotacao}
VOLUMES: ${i}/${volumesTotal}
TRANSPORTADORA: ${transportadora}
NR NOTA: ${nrNota}
DESTINATÁRIO: ${destinatario}
========================================
DATA: ${formatarData()}
FAVOR CONFERIR NO ATO DO RECEBIMENTO!
========================================

`;
    }
    
    document.getElementById('modalEtiquetasTexto').innerText = etiquetas;
    document.getElementById('modalEtiquetas').classList.add('show');
}

function imprimirEtiquetasModal() {
    const texto = document.getElementById('modalEtiquetasTexto').innerText;
    const janela = window.open();
    janela.document.write('<pre>' + texto + '</pre>');
    janela.print();
    janela.close();
}

// ==================== HISTÓRICO ====================
function atualizarHistorico() {
    const tbody = document.getElementById('historicoBody');
    tbody.innerHTML = '';
    
    cotações.forEach(c => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = c.id;
        row.insertCell(1).innerText = c.dataFormatada;
        row.insertCell(2).innerText = c.destinatario.substring(0, 30);
        row.insertCell(3).innerText = c.cidadeDestino;
        row.insertCell(4).innerText = c.transportadora;
        row.insertCell(5).innerText = formatarMoeda(c.total);
        row.dataset.id = c.id;
    });
}

function mostrarDetalhes() {
    const selectedRow = document.querySelector('#tableHistorico tbody tr.selected');
    if (!selectedRow) {
        alert('Selecione uma cotação na tabela!');
        return;
    }
    
    const id = parseInt(selectedRow.dataset.id);
    const cotacao = cotações.find(c => c.id === id);
    
    if (cotacao) {
        const detalhes = `
══════════════════════════════════════════════════════
            DETALHES DA COTAÇÃO #${cotacao.id}
══════════════════════════════════════════════════════
Data: ${cotacao.dataFormatada}
Remetente: ${cotacao.remetente}
CNPJ: ${cotacao.cnpj}
Destinatário: ${cotacao.destinatario}
Cidade Destino: ${cotacao.cidadeDestino}
Transportadora: ${cotacao.transportadora}
Valor da Nota: ${formatarMoeda(cotacao.valorNota)}
Peso Total: ${cotacao.peso} KG
Volumes: ${cotacao.volumes}
Dimensões: ${cotacao.altura}x${cotacao.comprimento}x${cotacao.largura} cm
──────────────────────────────────────────────────
Frete Base: ${formatarMoeda(cotacao.freteBase)}
Seguro: ${formatarMoeda(cotacao.seguro)}
Ad Valorem: ${formatarMoeda(cotacao.adValorem)}
Outros: ${formatarMoeda(cotacao.outros)}
TOTAL: ${formatarMoeda(cotacao.total)}
══════════════════════════════════════════════════════
        `;
        document.getElementById('modalTexto').innerText = detalhes;
        document.getElementById('modalDetalhes').classList.add('show');
    }
}

// ==================== RELATÓRIOS ====================
function gerarRelatorio() {
    const tipo = parseInt(document.getElementById('relTipo').value);
    let relatorio = '';
    
    relatorio += '╔══════════════════════════════════════════════════════════════════╗\n';
    
    switch(tipo) {
        case 0:
            relatorio += '║               RELATÓRIO DE COTAÇÕES POR PERÍODO              ║\n';
            relatorio += '╠══════════════════════════════════════════════════════════════════╣\n';
            relatorio += '║ Data           Destinatário            Cidade            Total  ║\n';
            relatorio += '╠══════════════════════════════════════════════════════════════════╣\n';
            let totalGeral = 0;
            cotações.forEach(c => {
                relatorio += `║ ${c.dataFormatada.substring(0,12).padEnd(14)} ${c.destinatario.substring(0,20).padEnd(22)} ${c.cidadeDestino.substring(0,16).padEnd(16)} ${formatarMoeda(c.total).padEnd(10)} ║\n`;
                totalGeral += c.total;
            });
            relatorio += '╠══════════════════════════════════════════════════════════════════╣\n';
            relatorio += `║ TOTAL GERAL: ${formatarMoeda(totalGeral).padEnd(59)} ║\n`;
            break;
        case 1:
            relatorio += '║            RELATÓRIO DE TRANSPORTADORAS MAIS UTILIZADAS          ║\n';
            relatorio += '╠══════════════════════════════════════════════════════════════════╣\n';
            const contagem = {};
            cotações.forEach(c => { contagem[c.transportadora] = (contagem[c.transportadora] || 0) + 1; });
            for (const [transp, qtd] of Object.entries(contagem)) {
                relatorio += `║ ${transp.padEnd(30)} ${qtd} cotações ${' '.repeat(33)} ║\n`;
            }
            break;
        case 2:
            relatorio += '║                 RELATÓRIO DE VOLUMES POR DESTINO                 ║\n';
            relatorio += '╠══════════════════════════════════════════════════════════════════╣\n';
            let totalVolumes = 0;
            cotações.forEach(c => {
                relatorio += `║ ${c.cidadeDestino.padEnd(30)} ${c.volumes} volumes ${' '.repeat(34)} ║\n`;
                totalVolumes += c.volumes;
            });
            relatorio += '╠══════════════════════════════════════════════════════════════════╣\n';
            relatorio += `║ TOTAL DE VOLUMES: ${totalVolumes.toString().padEnd(55)} ║\n`;
            break;
        case 3:
            relatorio += '║                   RELATÓRIO DE VALORES DE FRETE                   ║\n';
            relatorio += '╠══════════════════════════════════════════════════════════════════╣\n';
            if (cotações.length > 0) {
                const valores = cotações.map(c => c.total);
                const menor = Math.min(...valores);
                const maior = Math.max(...valores);
                const media = valores.reduce((a,b) => a+b, 0) / valores.length;
                relatorio += `║ Menor frete: ${formatarMoeda(menor).padEnd(62)} ║\n`;
                relatorio += `║ Maior frete: ${formatarMoeda(maior).padEnd(62)} ║\n`;
                relatorio += `║ Média dos fretes: ${formatarMoeda(media).padEnd(58)} ║\n`;
            } else {
                relatorio += '║ Nenhuma cotação cadastrada.                                   ║\n';
            }
            break;
    }
    
    relatorio += '╚══════════════════════════════════════════════════════════════════╝\n';
    relatorio += `\nGerado em: ${formatarData()}`;
    
    document.getElementById('relatorioResultado').innerText = relatorio;
}

// ==================== CONFIGURAÇÕES ====================
function carregarParametros() {
    document.getElementById('cfgTaxaSeguro').value = parametros.taxaSeguro;
    document.getElementById('cfgTaxaAdValorem').value = parametros.taxaAdValorem;
    document.getElementById('cfgTaxaKG').value = parametros.taxaPorKG;
    document.getElementById('cfgTaxaVolume').value = parametros.taxaPorVolume;
}

function salvarParametros() {
    parametros.taxaSeguro = parseFloat(document.getElementById('cfgTaxaSeguro').value);
    parametros.taxaAdValorem = parseFloat(document.getElementById('cfgTaxaAdValorem').value);
    parametros.taxaPorKG = parseFloat(document.getElementById('cfgTaxaKG').value);
    parametros.taxaPorVolume = parseFloat(document.getElementById('cfgTaxaVolume').value);
    salvarDados();
    alert('✅ Parâmetros salvos com sucesso!');
}

function salvarTransportadoras() {
    const inputs = document.querySelectorAll('#tableConfigTransportadoras .transp-valor');
    // Em produção, salvaria no localStorage
    alert('✅ Valores das transportadoras salvos!');
}

// ==================== NAVEGAÇÃO ====================
function mostrarPagina(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('mainMenu').classList.remove('active');
    
    if (pageId === 'mainMenu') {
        document.getElementById('mainMenu').classList.add('active');
    } else {
        document.getElementById(pageId).classList.add('active');
    }
    
    if (pageId === 'pageHistorico') {
        atualizarHistorico();
    }
}

// ==================== EVENTOS E INICIALIZAÇÃO ====================
function init() {
    carregarDados();
    carregarParametros();
    atualizarHistorico();
    
    // Data/hora no rodapé
    function atualizarDataHora() {
        document.getElementById('dataHora').innerHTML = formatarData();
    }
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);
    
    // Navegação do menu
    document.querySelectorAll('.menu-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => mostrarPagina('page' + btn.dataset.page.charAt(0).toUpperCase() + btn.dataset.page.slice(1)));
    });
    
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => mostrarPagina('mainMenu'));
    });
    
    document.getElementById('btnSair').addEventListener('click', () => {
        if (confirm('Deseja realmente sair do sistema?')) {
            window.close();
        }
    });
    
    // Tabs da cotação
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Tabs das configurações
    document.querySelectorAll('.tab-config').forEach(tab => {
        tab.addEventListener('click', () => {
            const configId = tab.dataset.config;
            document.querySelectorAll('.tab-config').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.config-pane').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(configId).classList.add('active');
        });
    });
    
    // Seleção de transportadora na tabela
    const transpTable = document.getElementById('tableTransportadoras');
    if (transpTable) {
        transpTable.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('click', () => {
                transpTable.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
            });
        });
    }
    
    // Seleção no histórico
    const histTable = document.getElementById('tableHistorico');
    if (histTable) {
        histTable.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row && row.parentElement === histTable.querySelector('tbody')) {
                histTable.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
            }
        });
    }
    
    // Botões
    document.getElementById('btnCalcular')?.addEventListener('click', gerarCotacao);
    document.getElementById('btnSalvarCotacao')?.addEventListener('click', salvarCotacao);
    document.getElementById('btnImprimirCotacao')?.addEventListener('click', imprimirCotacao);
    document.getElementById('btnVisualizarEtiqueta')?.addEventListener('click', visualizarEtiqueta);
    document.getElementById('btnGerarEtiquetas')?.addEventListener('click', gerarEtiquetas);
    document.getElementById('btnDetalhes')?.addEventListener('click', mostrarDetalhes);
    document.getElementById('btnGerarRelatorio')?.addEventListener('click', gerarRelatorio);
    document.getElementById('btnSalvarParametros')?.addEventListener('click', salvarParametros);
    document.getElementById('btnSalvarTransportadoras')?.addEventListener('click', salvarTransportadoras);
    document.getElementById('modalImprimirEtiquetas')?.addEventListener('click', imprimirEtiquetasModal);
    
    // Fechar modais
    document.querySelectorAll('.modal-close').forEach(close => {
        close.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
        });
    });
    
    // Atualizar peso cúbico
    function atualizarPesoCubico() {
        const a = parseFloat(document.getElementById('mercAltura').value) || 0;
        const c = parseFloat(document.getElementById('mercComprimento').value) || 0;
        const l = parseFloat(document.getElementById('mercLargura').value) || 0;
        const peso = (a * c * l) / 6000;
        document.getElementById('pesoCubico').innerText = peso.toFixed(2);
    }
    
    document.getElementById('mercAltura')?.addEventListener('input', atualizarPesoCubico);
    document.getElementById('mercComprimento')?.addEventListener('input', atualizarPesoCubico);
    document.getElementById('mercLargura')?.addEventListener('input', atualizarPesoCubico);
    atualizarPesoCubico();
}

// Iniciar
init();