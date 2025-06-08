import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const host = "0.0.0.0";
const port = 3000;
var listaProdutos = [];
const app = express();


app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: "M1nh4Ch4v3S3cr3t4",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        secure: false
    }
}));


app.use(cookieParser());


function verificarAutenticacao(requisicao, resposta, next) {
    if (requisicao.session.logado) {
        next();
    } else {
        resposta.redirect("/login");
    }
}


const estiloGlobal = `
    <style>
        :root {
            --cor-primaria: #6c5ce7;
            --cor-secundaria: #a29bfe;
            --cor-texto: #2d3436;
            --cor-fundo: #f5f6fa;
            --cor-card: #ffffff;
            --cor-borda: #dfe6e9;
            --cor-destaque: #00b894;
            --cor-erro: #d63031;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--cor-fundo);
            color: var(--cor-texto);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        
        .navbar {
            background-color: var(--cor-primaria) !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .navbar-brand, .nav-link {
            color: white !important;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .card {
            background-color: var(--cor-card);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border: none;
            margin-bottom: 20px;
        }
        
        .card-header {
            background-color: var(--cor-primaria);
            color: white;
            border-radius: 10px 10px 0 0 !important;
        }
        
        .btn-primary {
            background-color: var(--cor-primaria);
            border-color: var(--cor-primaria);
        }
        
        .btn-primary:hover {
            background-color: #5649d6;
            border-color: #5649d6;
        }
        
        .form-control:focus {
            border-color: var(--cor-secundaria);
            box-shadow: 0 0 0 0.25rem rgba(108, 92, 231, 0.25);
        }
        
        .table {
            background-color: var(--cor-card);
        }
        
        .table th {
            background-color: var(--cor-secundaria);
            color: white;
        }
        
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, var(--cor-primaria) 0%, var(--cor-secundaria) 100%);
        }
        
        .login-card {
            width: 100%;
            max-width: 400px;
            padding: 30px;
            border-radius: 15px;
            background-color: var(--cor-card);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .login-title {
            color: var(--cor-primaria);
            text-align: center;
            margin-bottom: 30px;
        }
        
        .alert-error {
            background-color: var(--cor-erro);
            color: white;
        }
        
        .last-login {
            color: var(--cor-secundaria);
            font-size: 0.9rem;
        }
    </style>
`;


app.get("/", verificarAutenticacao, (requisicao, resposta) => {
    const ultimoLogin = requisicao.cookies.ultimoLogin;
    resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Sistema de Produtos</title>
                ${estiloGlobal}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container">
                        <a class="navbar-brand fw-bold" href="#"> EstoquePlus</a>
                        <div class="collapse navbar-collapse">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/cadastroProduto"> Novo Produto</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout"> Sair</a>
                                </li>
                            </ul>
                            ${ultimoLogin ? `<span class="last-login ms-3">Último acesso: ${ultimoLogin}</span>` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="container mt-5">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="mb-0">Bem-vindo, ${requisicao.session.usuario}!</h2>
                        </div>
                        <div class="card-body">
                            <p class="lead">Gerencie seu estoque de forma simples e eficiente.</p>
                            <a href="/cadastroProduto" class="btn btn-primary btn-lg">Cadastrar Produto</a>
                        </div>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);
});


app.get("/login", (requisicao, resposta) => {
    resposta.send(`
    <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Acessar Sistema</title>
            ${estiloGlobal}
        </head>
        <body>
            <div class="login-container">
                <div class="login-card">
                    <h1 class="login-title">EstoquePlus</h1>
                    <form action="/login" method="post">
                        <div class="mb-3">
                            <label for="usuario" class="form-label"> Usuário</label>
                            <input type="text" class="form-control form-control-lg" id="usuario" name="usuario" required>
                        </div>
                        <div class="mb-4">
                            <label for="senha" class="form-label"> Senha</label>
                            <input type="password" class="form-control form-control-lg" id="senha" name="senha" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 btn-lg">Entrar</button>
                    </form>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
    </html>
    `);
});


app.post("/login", (requisicao, resposta) => {
    const usuario = requisicao.body.usuario;
    const senha = requisicao.body.senha;
    
    if (usuario === "admin" && senha === "123") {
        requisicao.session.logado = true;
        requisicao.session.usuario = usuario;
        const dataHoraAtuais = new Date();
        resposta.cookie('ultimoLogin', dataHoraAtuais.toLocaleString(), { 
            maxAge: 1000 * 60 * 60 * 24 * 30 
        });
        resposta.redirect("/");
    } else {
        resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Acessar Sistema</title>
                ${estiloGlobal}
            </head>
            <body>
                <div class="login-container">
                    <div class="login-card">
                        <h1 class="login-title">EstoquePlus</h1>
                        <div class="alert alert-error mb-4">
                            Usuário ou senha inválidos!
                        </div>
                        <form action="/login" method="post">
                            <div class="mb-3">
                                <label for="usuario" class="form-label"> Usuário</label>
                                <input type="text" class="form-control form-control-lg" id="usuario" name="usuario" required>
                            </div>
                            <div class="mb-4">
                                <label for="senha" class="form-label"> Senha</label>
                                <input type="password" class="form-control form-control-lg" id="senha" name="senha" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 btn-lg">Entrar</button>
                        </form>
                    </div>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
        `);
    }
});


app.get("/cadastroProduto", verificarAutenticacao, (requisicao, resposta) => {
    const ultimoLogin = requisicao.cookies.ultimoLogin;
    
    let tabelaProdutos = '';
    if (listaProdutos.length > 0) {
        tabelaProdutos = `
            <div class="card mt-4">
                <div class="card-header">
                    <h3 class="mb-0"> Produtos Cadastrados</h3>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th> Código</th>
                                    <th> Descrição</th>
                                    <th> Custo</th>
                                    <th> Venda</th>
                                    <th> Validade</th>
                                    <th> Estoque</th>
                                    <th> Fabricante</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${listaProdutos.map(produto => `
                                    <tr>
                                        <td>${produto.codigoBarras}</td>
                                        <td>${produto.descricao}</td>
                                        <td>R$ ${parseFloat(produto.precoCusto).toFixed(2)}</td>
                                        <td>R$ ${parseFloat(produto.precoVenda).toFixed(2)}</td>
                                        <td>${new Date(produto.dataValidade).toLocaleDateString('pt-BR')}</td>
                                        <td>${produto.quantidadeEstoque}</td>
                                        <td>${produto.fabricante}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    resposta.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Cadastro de Produtos</title>
                ${estiloGlobal}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container">
                        <a class="navbar-brand fw-bold" href="/"> EstoquePlus</a>
                        <div class="collapse navbar-collapse">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">Sair</a>
                                </li>
                            </ul>
                            ${ultimoLogin ? `<span class="last-login ms-3">Último acesso: ${ultimoLogin}</span>` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="container mt-4">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="mb-0"> Cadastrar Novo Produto</h2>
                        </div>
                        <div class="card-body">
                            <form method="POST" action="/cadastroProduto">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label for="codigoBarras" class="form-label"> Código de Barras</label>
                                        <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="descricao" class="form-label"> Descrição do Produto</label>
                                        <input type="text" class="form-control" id="descricao" name="descricao" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="precoCusto" class="form-label"> Preço de Custo (R$)</label>
                                        <input type="number" step="0.01" class="form-control" id="precoCusto" name="precoCusto" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="precoVenda" class="form-label"> Preço de Venda (R$)</label>
                                        <input type="number" step="0.01" class="form-control" id="precoVenda" name="precoVenda" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="dataValidade" class="form-label"> Data de Validade</label>
                                        <input type="date" class="form-control" id="dataValidade" name="dataValidade" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="quantidadeEstoque" class="form-label"> Quantidade em Estoque</label>
                                        <input type="number" class="form-control" id="quantidadeEstoque" name="quantidadeEstoque" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="fabricante" class="form-label">Fabricante</label>
                                        <input type="text" class="form-control" id="fabricante" name="fabricante" required>
                                    </div>
                                    <div class="col-12 mt-4">
                                        <button type="submit" class="btn btn-primary me-2"> Salvar Produto</button>
                                        <a href="/" class="btn btn-outline-secondary"> Voltar</a>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    ${tabelaProdutos}
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);
});


app.post("/cadastroProduto", verificarAutenticacao, (requisicao, resposta) => {
    const produto = {
        codigoBarras: requisicao.body.codigoBarras,
        descricao: requisicao.body.descricao,
        precoCusto: requisicao.body.precoCusto,
        precoVenda: requisicao.body.precoVenda,
        dataValidade: requisicao.body.dataValidade,
        quantidadeEstoque: requisicao.body.quantidadeEstoque,
        fabricante: requisicao.body.fabricante
    };
    
    listaProdutos.push(produto);
    resposta.redirect("/cadastroProduto");
});


app.get("/logout", (requisicao, resposta) => {
    requisicao.session.destroy();
    resposta.redirect("/login");
});

app.listen(port, host, () => {
    console.log(`Servidor em execução em http://${host}:${port}/`);
});