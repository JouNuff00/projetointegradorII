// ... seu código existente ...

// indexprojeto.js
const Projeto = require('./indexprojeto');

(async () => {
  await Projeto('TABLE_NAME');
})();

async function ativacaoDoServidor() {
    try {
        const conn = await bd.getConexao();
        // Your other code here
    } catch (err) {
        console.error(err);
    }
}

ativacaoDoServidor();


bd.getConexao().then(conn => {
    console.log('Conexão com BD estabelecida!');
}).catch(erro => {
    console.log('Erro ao obter conexão com BD:', erro);
});

function gerarCartao() {
    const numeroCartao = Math.floor(Math.random() * 1000000000);
    document.getElementById('numeroCartao').innerHTML = numeroCartao;
  
    // Enviar o número do cartão para o servidor
    axios.post('http://localhost:3000/salvarNumeroCartao', {
      numeroCartao: numeroCartao
    })
    .then(response => {
      console.log(response.data); // Exibe a resposta do servidor no console (opcional)
    })
    .catch(error => {
      console.error('Erro ao salvar número do cartão:', error);
    });
  }
  
 

function efetuarCompra() {
    const numeroCartao = document.getElementById('numeroCartaoCompra').value;
    const servicosSelecionados = [];
    const url = `http://localhost:3000/Servicos/${codigoServico}`;
    
    axios.get(url)
        .then(response => {
        // Lógica para processar a resposta do servidor após obter detalhes do serviço
        const servicoDetalhes = response.data;
        
        // Lógica para prosseguir com a compra, por exemplo, exibindo os detalhes do serviço para confirmação
        console.log('Detalhes do Serviço:', servicoDetalhes);
    
        // Lógica para continuar com a compra ou exibir uma mensagem de confirmação para o usuário
        // ...
        })
        .catch(error => {
        if (error.response) {
            const msg = new Comunicado(error.response.data.codigo,
            error.response.data.mensagem,
            error.response.data.descricao);
            alert(msg.get());
        }
        });
    
    event.preventDefault();
}
    