// Boa prática: espera todo o conteúdo do HTML ser carregado antes de executar o JavaScript.
document.addEventListener('DOMContentLoaded', () => {

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

            const apiUrl = 'https://in6daks3fk.execute-api.us-east-2.amazonaws.com/dev/pedidos';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
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

            const apiBaseUrl = 'https://in6daks3fk.execute-api.us-east-2.amazonaws.com/dev';

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
                    body: arquivo // O objeto do arquivo é enviado diretamente no corpo
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

    // --- ESPAÇO PARA A LÓGICA DE MOSTRAR PEDIDOS ---

});