import fs from 'fs/promises'
import PromptSync from 'prompt-sync'
const prompt = PromptSync()

const filePath = './tarefas.json'

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
    const novoId = tarefas.reduce((max, t) => {
        return t.id > max ? t.id : max
    }, 0) + 1
    

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


async function menu() {
    let opcao = ''

    do {
        console.log('\n=== MENU ===')
        console.log('1 - Criar uma nova tarefa')
        console.log('2 - Vizualizar todas as tarefas')
        console.log('3 - Visualizar apenas tarefas concluídas')
        console.log('4 - Visualizar apenas tarefas não concluídas')
        console.log('5 - Concluir uma tarefa')
        console.log('6 - Sair')

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
                console.log('Saindo...')
                break                
            default:
                console.log('Opção invalida. Tente novamnete!')
        }
    } while (opcao !== '6')
}

await menu()