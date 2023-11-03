function Projeto(bd) 
{
    // ... conexao com oracle ...

    this.getConexao = async function () {
        if (global.conexao) return global.conexao;

        const oracledb = require('oracledb');
        oracledb.autoCommit = true; // Configuração para auto commit

        const dbConfig = {
            user: 'PROJETO',
            password: 'PROJETO',
            connectString: 'localhost:1522/XEPDB1'
        };

        try {
            global.conexao = await oracledb.getConnection(dbConfig);
        } catch (erro) {
            console.log('Não foi possível estabelecer conexão com o BD!');
            process.exit(1);
        }

        return global.conexao;
    };

    // ... criação de tabelas pré-estabelecidas ...


    this.estrutureSe = async function () {
        try {
            const conexao = await this.getConexao();
            const sqlServicos = 'CREATE TABLE Servicos (Codigo NUMBER(10) PRIMARY KEY, ' +
            'tipo_servico NVARCHAR2(10) NOT NULL)';
            await conexao.execute(sqlServicos);
        
            const sqlCartoes = 'CREATE TABLE Cartoes (numero_cartao NUMBER(10) PRIMARY KEY)';
            await conexao.execute(sqlCartoes);
        
            const sqlAssociacao = 'CREATE TABLE Associacao_Cartao_Servicos (' +
            'id_cartao NUMBER(10), ' +
            'id_servico NUMBER(10), ' +
            'FOREIGN KEY (id_cartao) REFERENCES Cartoes(numero_cartao), ' +
            'FOREIGN KEY (id_servico) REFERENCES Servicos(Codigo))';
            await conexao.execute(sqlAssociacao);
        } catch (erro) {
            // Se as tabelas já existem, ignora e continua
            console.error(erro);
        }
    };
  

        // Função para inserir o número do cartão na tabela Cartoes
    this.inserirNovoCartao = async function (numeroCartao) {
        let conexao;
        try {
            conexao = await this.getConexao();
            await conexao.execute("BEGIN");
        
            const inserirCartaoSQL = "INSERT INTO Cartoes (numero_cartao) VALUES (:numeroCartao) RETURNING numero_cartao INTO :cartaoId";
            const cartaoId = {
                dir: oracledb.BIND_OUT,
                type: oracledb.NUMBER
            };
            const result = await conexao.execute(inserirCartaoSQL, { numeroCartao: numeroCartao, cartaoId: cartaoId });
        
            await conexao.execute("COMMIT");
            
            return result.outBinds.cartaoId[0];
        } catch (erro) {
            if (conexao) {
                await conexao.execute("ROLLBACK");
            }
            console.error("Erro ao inserir novo cartão:", erro);
            throw erro;
        } finally {
            if (conexao) {
                await conexao.close();
            }
        }
    };

    // Função para associar serviços ao cartão na tabela Associacao_Cartao_Servicos
    this.associarServicosAoCartao = async function (numeroCartao, servicosComprados) {
        let conexao;
        try {
            conexao = await this.getConexao();
            await conexao.execute("BEGIN");
        
            for (const servicoId of servicosComprados) {
                const inserirAssociacaoSQL = "INSERT INTO Associacao_Cartao_Servicos (id_cartao, id_servico) VALUES (:cartaoId, :servicoId)";
                await conexao.execute(inserirAssociacaoSQL, { cartaoId: numeroCartao, servicoId: servicoId });
            }
        
            await conexao.execute("COMMIT");
        } catch (erro) {
            if (conexao) {
                await conexao.execute("ROLLBACK");
            }
            console.error("Erro ao associar serviços ao cartão:", erro);
            throw erro;
        } finally {
            if (conexao) {
                await conexao.close();
            }
        }
    }
}





function middleWareGlobal (req, res, next)
{
    console.time('Requisição'); // marca o início da requisição
    console.log('Método: '+req.method+'; URL: '+req.url); // retorna qual o método e url foi chamada

    next(); // função que chama as próximas ações

    console.log('Finalizou'); // será chamado após a requisição ser concluída

    console.timeEnd('Requisição'); // marca o fim da requisição
}


async function ativacaoDoServidor() {
    const bd = new BD();
    const projeto = new Projeto(bd);
    await bd.getConexao(); // Estabelece a conexão com o banco de dados Oracle
    await bd.estrutureSe(); // Cria a tabela se não existir
    global.Projeto = new Projeto(bd);

    const express = require('express');
    const app     = express();
	const cors    = require('cors')
    
    app.use(express.json());   // faz com que o express consiga processar JSON
	app.use(cors()) //habilitando cors na nossa aplicacao (adicionar essa lib como um middleware da nossa API - todas as requisições passarão antes por essa biblioteca).
    app.use(middleWareGlobal); // app.use cria o middleware global

        // Endpoint para salvar o número do cartão na tabela Cartoes
    app.post('/salvarNumeroCartao', async (req, res) => {
        const numeroCartao = req.body.numeroCartao;

        try {
            // Inserir o número do cartão na tabela Cartoes e obter o ID do cartão inserido
            const cartaoId = await this.inserirNovoCartao(numeroCartao);

            res.send({ cartaoId: cartaoId, message: 'Número do cartão salvo com sucesso!' });
        } catch (erro) {
            console.error('Erro ao salvar número do cartão:', erro);
            res.status(500).send('Erro ao salvar número do cartão.');
        }
    });

    // Endpoint para associar serviços ao cartão na tabela Associacao_Cartao_Servicos
    app.post('/associarServicosAoCartao', async (req, res) => {
        const cartaoId = req.body.cartaoId;
        const servicosComprados = req.body.servicosComprados; // Array de IDs dos serviços comprados

        try {
            // Associar os serviços comprados ao cartão na tabela Associacao_Cartao_Servicos
            await this.associarServicosAoCartao(cartaoId, servicosComprados);

            res.send('Serviços comprados associados ao cartão com sucesso!');
        } catch (erro) {
            console.error('Erro ao associar serviços ao cartão:', erro);
            res.status(500).send('Erro ao associar serviços ao cartão.');
        }
    });

}

ativacaoDoServidor();


