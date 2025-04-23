import fs from 'fs/promises'
import PromptSync from 'prompt-sync'
import bcrypt from 'bcrypt'
const prompt = PromptSync()

const filePath = './tarefas.json'
const userPath = './usuarios.json'

// AUTENTICAÇÃO
async function lerUsuarios() {
    try {
        const dados = await fs.readFile(userPath, 'utf-8')
        return JSON.parse(dados)
    } catch (error) {
        console.log(`Erro em ler usuarios: ${error.message}`)
        return undefined
    }
}

async function escreverUsuarios(escreverUser) {
    await fs.writeFile(userPath, JSON.stringify(escreverUser, null, 2), 'utf-8')
    console.log("Arquivo atualizado com sucesso!")
}

const cadastrarUsuario = async () => {
    const usuarios = await lerUsuarios()

    const usuario = prompt("Digite seu usuário: ")
    const existe = usuarios.find(u => u.usuario === usuario)
    if (existe) {
        console.log('Usuário existente!')
        return
    }

    const senha = prompt("Digite sua senha: ", { echo: '' })
    const senhaCriptografada = await bcrypt.hash(senha, 10)

    usuarios.push({ usuario, senha: senhaCriptografada})
    await escreverUsuarios(usuarios)
    console.log(`O usuário ${usuario} foi cadastrado com sucesso!`)
    await fluxoCode()
}

const login = async () => {
    const usuarios = await lerUsuarios()

    const usuarioInput = prompt('Digite seu usuário: ')
    const existe = usuarios.find(u => u.usuario === usuarioInput)
    if (!existe) {
        console.log('Usuário inexistente. Cadastre-se para acessar!')
        await new Promise(resolve => setTimeout(resolve, 3000))
        return await fluxoCode()
    }

    const senhaInput = prompt('Digite sua senha: ', { echo: '' })
    const senhaCorreta = await bcrypt.compare(senhaInput, existe.senha)

    if (senhaCorreta) {
        console.log(`Login efetuado com sucesso! Bem vindo ${usuarioInput}`)
        await new Promise(resolve => setTimeout(resolve, 3000))
        return await menu()
    }

    if(!senhaCorreta) {
        return alterarSenha()
    }
}

const alterarSenha = async () => {
    const usuarios = await lerUsuarios()

    console.log('== Recupere sua senha ==')
    const usuario = prompt('Digite seu usuário: ')
    const existe = usuarios.find(u => u.usuario === usuario)

    if (!existe) {
        console.log('Usuário inexistente!')
        return await fluxoCode()
    }

    const novaSenha = prompt('Digite sua nova senha: ', { echo: ''}) // echo funciona para esconder a senha enquanto digita.
    const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10)

    existe.senha = novaSenhaCriptografada
    
    await escreverUsuarios(usuarios)
    console.log(`Senha do usuário ${usuario} modificada com sucesso!`)
}

const fluxoCode = async () => {
    let opcao = ''
    do {
        console.clear()
        console.log('=== ÁREA DE LOGIN ===')
        console.log('1. Fazer login')
        console.log('2. Cadastrar usuário')
        console.log('3. Altere sua senha')
        console.log('4. Sair do sistema')

        opcao = prompt('Digite a opção: ')

        switch (opcao) {
            case '1':
                await login()
                break;
            case '2':
                await cadastrarUsuario()
                break
            case '3':
                await alterarSenha()
                break    
            case '4':
                console.log('Saindo...')
                break    
            default:
                console.log('Opção invalida. Tente novamente!')
                break;
        }
    }while (opcao !== '4')
}
await fluxoCode()

async function lerTarefas() {
    try {
        const dados = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(dados)
    } catch (error) {
        console.log(`Algo não se saiu bem: ${error.message}`)
        return undefined
    }
}

async function escreverArquivo(tarefa) {
    await fs.writeFile(filePath, JSON.stringify(tarefa, null, 2), 'utf-8')
    console.log('Tarefa adicionada com sucesso')
}


async function criarTarefa() {
    const titulo = prompt('Digite o título: ')
    const descricao = prompt('Digite a descrição: ')
    const tarefas = await lerTarefas()
    const novoId = tarefas[tarefas.length - 1].id + 1 // METODO UTILIZADO EM SALA DE AULA - MAIS EFICAZ
    // const novoId = tarefas.reduce((max, t) => {
    //     return t.id > max ? t.id : max
    // }, 0) + 1 ARQUIVO CRIADO INICIALMENTE
    

    const novaTarefa = {
        id: novoId,
        titulo,
        descricao,
        concluida: false
    }

    tarefas.push(novaTarefa)
    await escreverArquivo(tarefas)
}



async function vizualizarTodasTarefas() {
    const tarefas = await lerTarefas()

    if (tarefas.length > 0) {
        tarefas.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}, Título: ${item.titulo}, Descrição: ${item.descricao}, Concluída: ${item.concluida}`)
        })
    } else {
        console.log("Nenhuma tarefa encontrada!")
    }
}

async function tarefasConcluidas() {
    const tarefas = await lerTarefas()
    const concluidas = tarefas.filter(t => t.concluida === true)
    if (concluidas.length > 0) {
        console.log('\n Tarefas concluídas:\n')
        concluidas.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}, Título: ${item.titulo}, Descrição: ${item.descricao}, Concluída: ${item.concluida}`)
        })
    } else {
        console.log('Tarefas não encontradas!')
    }
}


async function tarefasNaoConcluidas() {
    const tarefas = await lerTarefas()
    const Naoconcluidas = tarefas.filter(t => t.concluida === false)
    if (Naoconcluidas.length > 0) {
        console.log('\n Tarefas não concluídas:\n')
        Naoconcluidas.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}, Título: ${item.titulo}, Descrição: ${item.descricao}, Concluída: ${item.concluida}`)
        })
    } else {
        console.log('Tarefas não encontradas!')
    }
}


async function concluirTarefa() {
    const tarefas = await lerTarefas()
    if (tarefas.length === 0) {
        console.log("Nenhuma tarefa encontrada.")
        return
    }

    console.log("\n Tarefas disponíveis:")
    tarefas.forEach(t => {
        console.log(`ID: ${t.id} | Título: ${t.titulo} | Concluída: ${t.concluida ? 'Sim' : 'Não'}`)
    })

    const concluirT = +prompt('Digite o ID da tarefa que deseja concluir: ')

    const tarefa = tarefas.find(t => t.id === concluirT)

    if (!tarefa) {
        console.log("Tarefa não encontrada.")
        return
    }

    tarefa.concluida = true
    await escreverArquivo(tarefas)
    console.log(`Tarefa ${tarefa.titulo} foi concluída com sucesso!`)
}

const excluirTarefa = async () => {
    const tarefas =  await lerTarefas()

    if (tarefas.length === 0) {
        console.log('Nenhuma tarefa encontrada!')
        return
    }

    console.log("Tarefas disponíveis:")
    tarefas.forEach((tarefa, index) => {
        console.log(`${index + 1}. Título: ${tarefa.titulo}, Descrição: ${tarefa.descricao}`)
    })

    const escolhaExcluir = +prompt('Digite o ID da tarefa que você deseja excluir: ')
    const index = tarefas.findIndex(t => t.id === escolhaExcluir)

    // O -1 é quando ele não encontra o item dentro do array
    if (index === -1) {
        console.log('Tarefa não encontrada.')
        return
    }

    // Para observarmos a tarefa excluída
    const tarefaRemovida = tarefas.splice(index, 1)[0]
    await escreverArquivo(tarefas)
    console.log(`Tarefa "${tarefaRemovida.titulo}" foi excluída com sucesso!`)
}


async function menu() {
    let opcao = ''

    do {
        console.log('\n=== MENU ===')
        console.log('1 - Criar uma nova tarefa')
        console.log('2 - Vizualizar todas as tarefas')
        console.log('3 - Visualizar apenas tarefas concluídas')
        console.log('4 - Visualizar apenas tarefas não concluídas')
        console.log('5 - Concluir uma tarefa')
        console.log('6 - Excluir uma tarefa')
        console.log('7 - Sair')

        opcao = prompt('Escolha a sua opção: ')

        switch (opcao) {
            case '1':
                await criarTarefa()
                break;
            case '2':
                await vizualizarTodasTarefas()    
                break
            case '3':
                await tarefasConcluidas()
                break
            case '4':
                await tarefasNaoConcluidas()
                break
            case '5':
                await concluirTarefa()
                break
            case '6':
                await excluirTarefa()    
            case '7':
                console.log('Saindo...')
                break                
            default:
                console.log('Opção invalida. Tente novamnete!')
        }
    } while (opcao !== '7')
}

// await menu()