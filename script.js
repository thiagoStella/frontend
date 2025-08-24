// Boa prática: espera todo o conteúdo do HTML ser carregado antes de executar o JavaScript.
document.addEventListener('DOMContentLoaded', () => {

    // URL base da nossa API, usada por todas as funções
    const apiBaseUrl = 'https://in6daks3fk.execute-api.us-east-2.amazonaws.com/dev';

    // --- LÓGICA PARA O FORMULÁRIO DE NOVO PEDIDO ---
    const formNovoPedido = document.getElementById('form-novo-pedido');

    if (formNovoPedido) {
        formNovoPedido.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(formNovoPedido);
            const dadosDoForm = Object.fromEntries(formData.entries());
            
            const payloadFinal = {
                pedidoId: dadosDoForm.pedidoId,
                clienteId: dadosDoForm.clienteId,
                itens: [
                    {
                        produto: dadosDoForm.produto,
                        quantidade: parseInt(dadosDoForm.quantidade, 10) 
                    }
                ]
            };

            console.log("Enviando payload para a API:", payloadFinal);

            const apiUrl = `${apiBaseUrl}/pedidos`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadFinal),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erro desconhecido da API');
                }

                console.log('Sucesso:', data);
                alert('Pedido enviado com sucesso! Mensagem da API: ' + data.message);
                formNovoPedido.reset();

            } catch (error) {
                console.error('Erro na chamada fetch:', error);
                alert(`Ocorreu um erro ao enviar o pedido: ${error.message}`);
            }
        });
    }


    // --- LÓGICA PARA O UPLOAD DE ARQUIVOS ---
    const formUploadArquivo = document.getElementById('form-upload-arquivo');
    const arquivoInput = document.getElementById('arquivoPedidos');

    if (formUploadArquivo) {
        formUploadArquivo.addEventListener('submit', async (event) => {
            event.preventDefault();

            const arquivo = arquivoInput.files[0];
            if (!arquivo) {
                alert('Por favor, selecione um arquivo.');
                return;
            }

            const nomeArquivo = arquivo.name;
            console.log(`Arquivo selecionado: ${nomeArquivo}`);
            alert(`Preparando para enviar o arquivo: ${nomeArquivo}...`);

            try {
                // ETAPA 1: Pedir a URL segura para o nosso backend
                console.log('Pedindo URL de upload para a API...');
                const responseUrl = await fetch(`${apiBaseUrl}/upload-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: nomeArquivo })
                });

                if (!responseUrl.ok) throw new Error('Falha ao obter a URL de upload.');

                const dataUrl = await responseUrl.json();
                const uploadURL = dataUrl.uploadURL;
                console.log('URL de upload recebida:', uploadURL);

                // ETAPA 2: Usar a URL recebida para enviar o arquivo para o S3
                console.log('Enviando arquivo para o S3...');
                const responseUpload = await fetch(uploadURL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: arquivo
                });

                if (!responseUpload.ok) throw new Error('Falha ao enviar o arquivo para o S3.');

                console.log('Arquivo enviado com sucesso para o S3.');
                alert('Arquivo enviado com sucesso! O processamento no backend começará em breve.');
                formUploadArquivo.reset();

            } catch (error) {
                console.error('Erro no processo de upload:', error);
                alert(`Ocorreu um erro: ${error.message}`);
            }
        });
    }

    // --- LÓGICA PARA VISUALIZAR OS PEDIDOS ---
    const btnMostrarPedidos = document.getElementById('btn-mostrar-pedidos');
    const corpoTabelaPedidos = document.getElementById('corpo-tabela-pedidos');

    if (btnMostrarPedidos) {
        btnMostrarPedidos.addEventListener('click', async () => {
            console.log("Buscando pedidos na API...");
            alert("Buscando pedidos...");

            // Opções para formatar a data de forma mais legível
            const opcoesDeData = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Usa formato 24h
            };

            try {
                const response = await fetch(`${apiBaseUrl}/pedidos`);
                if (!response.ok) throw new Error('Falha ao buscar os pedidos.');

                const pedidos = await response.json();
                console.log("Pedidos recebidos (sem ordenar):", pedidos);

                // Ordena a lista de pedidos em ordem decrescente (do mais novo para o mais antigo)
                pedidos.sort((a, b) => {
                    const dataB = new Date(b.timestampProcessamento || 0);
                    const dataA = new Date(a.timestampProcessamento || 0);
                    return dataB - dataA;
                });
                
                console.log("Pedidos ordenados:", pedidos);

                // Limpa a tabela antes de adicionar as novas linhas
                corpoTabelaPedidos.innerHTML = '';

                if (pedidos.length === 0) {
                    corpoTabelaPedidos.innerHTML = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
                    return;
                }

                // Cria as linhas da tabela dinamicamente
                pedidos.forEach(pedido => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${pedido.pedidoId || 'N/A'}</td>
                        <td>${pedido.clienteId || 'N/A'}</td>
                        <td>${pedido.statusPedido || 'N/A'}</td>
                        <td>${pedido.origem || 'API'}</td>
                        <td>${new Date(pedido.timestampProcessamento || Date.now()).toLocaleString('pt-BR', opcoesDeData)}</td>
                    `;
                    corpoTabelaPedidos.appendChild(tr);
                });

            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
                alert(`Ocorreu um erro ao buscar os pedidos: ${error.message}`);
                corpoTabelaPedidos.innerHTML = `<tr><td colspan="5">Erro ao carregar pedidos: ${error.message}</td></tr>`;
            }
        });
    }

});