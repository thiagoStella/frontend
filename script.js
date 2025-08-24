// Boa prática: espera todo o conteúdo do HTML ser carregado antes de executar o JavaScript.
// O 'defer' na sua tag <script> no HTML também ajuda com isso, mas esta é a forma mais garantida.
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona o formulário pelo ID que definimos no HTML
    const formNovoPedido = document.getElementById('form-novo-pedido');

    // Adiciona o 'escutador' de evento para quando o formulário for submetido (evento 'submit')
    if (formNovoPedido) {
        formNovoPedido.addEventListener('submit', async (event) => {
            // 1. Boa Prática: Previne o comportamento padrão do navegador, que é recarregar a página.
            // Isso nos permite controlar o que acontece com os dados.
            event.preventDefault();
            console.log("Formulário enviado, página não recarregou.");

            // 2. Boa Prática: Extrai todos os dados do formulário de uma vez usando a API FormData.
            // É mais limpo do que pegar o valor de cada campo individualmente.
            const formData = new FormData(formNovoPedido);
            const dadosDoForm = Object.fromEntries(formData.entries());
            
            console.log("Dados brutos extraídos do formulário:", dadosDoForm);

            // 3. Transforma os dados do formulário no formato JSON exato que a nossa API espera.
            // Note que a API espera um array de 'itens'.
            const payloadFinal = {
                pedidoId: dadosDoForm.pedidoId,
                clienteId: dadosDoForm.clienteId,
                itens: [
                    {
                        produto: dadosDoForm.produto,
                        // O valor do input de quantidade vem como texto, convertemos para número.
                        quantidade: parseInt(dadosDoForm.quantidade, 10) 
                    }
                ]
            };

            console.log("Payload JSON pronto para enviar para a API:", payloadFinal);
            // ... (dentro do seu addEventListener, logo após a criação da 'payloadFinal')

console.log("Payload JSON pronto para enviar para a API:", payloadFinal);

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
        // Se a API retornar um erro (ex: 4xx, 5xx), ele será capturado aqui
        throw new Error(data.message || 'Erro desconhecido da API');
    }

    console.log('Sucesso:', data);
    alert('Pedido enviado com sucesso! Mensagem da API: ' + data.message);
    formNovoPedido.reset(); // Limpa o formulário após o sucesso

} catch (error) {
    // O erro de CORS vai aparecer no CONSOLE, não necessariamente aqui no catch.
    console.error('Erro na chamada fetch:', error);
    alert('Ocorreu um erro ao enviar o pedido. Verifique o console do navegador para detalhes (provavelmente CORS).');
}

        });
    }

});