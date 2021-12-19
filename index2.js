let localId;
let bancoDeDados;
let nomeDoBancoDeDados = "BancoDePostit2";
let nomeDaLista = "listaDeDados2"

function criaBancoDeDados () {
    
    let requisicao = window.indexedDB.open( nomeDoBancoDeDados, 1);

    requisicao.onsuccess = (evento) => {

        bancoDeDados = requisicao.result;

        console.log("banco de dados criado", evento, bancoDeDados);
        
        mostrarCardNaTela ()
    }

    requisicao.onupgradeneeded = (evento) => {

        bancoDeDados = evento.target.result;

        const objetoSalvo = bancoDeDados.createObjectStore(nomeDaLista, {
            keyPath: "id",
            autoIncrement: true
        });

        objetoSalvo.createIndex("lembrete", "lembrete", {unique: false});

        console.log("houve um upgrade", evento)
    }


    requisicao.onerror = (evento) => {

        console.log("hove um erro", evento);
    }
}

function salvarDados (conteudoTitulo, lembrete) {
    
   
    let localParaAdicionar = bancoDeDados.transaction([nomeDaLista], "readwrite");

    let listaParaAdicionar = localParaAdicionar.objectStore(nomeDaLista);

    let novaMensagem = {titulo: conteudoTitulo, mensagem: lembrete};

    listaParaAdicionar.add(novaMensagem);

    mostrarCardNaTela ()       
}


const abrirMenuEditar = (click) =>{

    localId = Number(click.target.getAttribute("data-id"));

    const paiDoAlvo = click.target.parentNode;
    const voDoalvo = paiDoAlvo.parentNode;
    
    const titulo = voDoalvo.querySelector("h4").textContent;
    const texto = voDoalvo.querySelector("p").textContent;

    let tituloEdicao = document.getElementById("titulo-editado");
    tituloEdicao.value = titulo
    let campoDeEdiçao = document.getElementById("mensagem-editada");
    campoDeEdiçao.value = texto
}

function salvarEdicao () {

    const titulo = document.getElementById("titulo-editado").value;
    const lembrete = document.getElementById("mensagem-editada").value;

    let localParaAdicionar = bancoDeDados.transaction([nomeDaLista], "readwrite");

    let listaParaAdicionar = localParaAdicionar.objectStore(nomeDaLista);

   
    // let local = listaParaAdicionar.get(localId);

    // local.onsuccess = function(e) {
    //     var data = e.target.result;

    //     console.log(`Data ${JSON.stringify(data)} localId: ${localId}`)
    //     data.mensagem = lembrete;
    //     listaParaAdicionar.put(data);
    // }

    listaParaAdicionar.put({id: localId, titulo: titulo, mensagem: lembrete});
    mostrarCardNaTela () 
 
}

function criarCard(titulo, conteudo, cursor) {

    let div = document.createElement("div");
    div.classList.add("post-it");

    let divtexto = document.createElement("div");
    divtexto.classList.add("textos");

    let divFilha = document.createElement("div");
    divFilha.classList.add("xis");
    divFilha.textContent = "X";
    divFilha.classList.add("botao-cancelar");
    divFilha.setAttribute("data-id", cursor.value.id);
    divFilha.addEventListener("click", removerItem);
    divFilha.addEventListener("click", esmaecerItem);

    let h4titulo = document.createElement("h4");
    h4titulo.textContent = titulo;
    h4titulo.classList.add("filtrar");
    h4titulo.setAttribute("data-id", cursor.value.id)
    h4titulo.addEventListener('click', abrirMenuEditar);
    h4titulo.addEventListener("click", ()=>{

        const menuNav = document.querySelector('.nav-deslizante')
    
        menuNav.classList.toggle('nav-deslizante--ativo');
        document.querySelector('.botao-adicionar').classList.toggle('apaga-botao');
    })


    let pConteudo = document.createElement("p");
    pConteudo.classList.add("texto");
    pConteudo.classList.add("filtrar");
    pConteudo.textContent = conteudo;
    pConteudo.setAttribute("data-id", cursor.value.id)
    pConteudo.addEventListener('click', abrirMenuEditar);
    pConteudo.addEventListener("click", ()=>{

        const menuNav = document.querySelector('.nav-deslizante')
    
        menuNav.classList.toggle('nav-deslizante--ativo');
        document.querySelector('.botao-adicionar').classList.toggle('apaga-botao');
    })

    let divBotoes = document.createElement("div");
    divBotoes.classList.add("botao-post-it");

    divtexto.appendChild(divFilha);
    divtexto.appendChild(h4titulo);

    divtexto.appendChild(pConteudo);
    

    div.appendChild(divtexto);
    
    console.log(div)


    return div;
}

const esmaecerItem = (evento) =>{
    const paiDoAlvo = evento.target.parentNode;
    const voDoalvo = paiDoAlvo.parentNode;
    
    voDoalvo.classList.add("esmaecer");
}

const removerItem = (eventoClick) => {

    setTimeout(function(){
        
        console.log(eventoClick.target);
    
        const localId = Number(eventoClick.target.getAttribute("data-id"));
    
        let localParaAdicionar = bancoDeDados.transaction([nomeDaLista], "readwrite");
    
        let listaParaAdicionar = localParaAdicionar.objectStore(nomeDaLista);
    
        listaParaAdicionar.delete(localId);
    
        mostrarCardNaTela ();

    }, 800)

}

function mostrarCardNaTela(){

    let local = document.querySelector(".container-cards");
    local.innerHTML  = ""

    let objetoGuardado = bancoDeDados.transaction(nomeDaLista).objectStore(nomeDaLista);

    objetoGuardado.openCursor().onsuccess = (evento) => {

        const cursor = evento.target.result;

        if(cursor){

            const titulo = cursor.value.titulo

            const conteudo = cursor.value.mensagem

            const card = criarCard(titulo, conteudo, cursor); 
        
            local.appendChild(card)

            cursor.continue();
        }
    }
}



function pegarDados(){
    
    var campoInformacoes = document.querySelector("[data-mensagem]");
    var conteudo = campoInformacoes.value;
    var campoTitulo = document.querySelector("[data-titulo]");
    var conteudoTitulo = campoTitulo.value;
    
    if(conteudo.length > 0){
        
        salvarDados(conteudoTitulo, conteudo);
               
        campoInformacoes.value = ""
        campoTitulo.value = ""

    }else{
        
        campoInformacoes.value = ""
        campoTitulo.value = ""
        
    }
}

// filtrar

let campoDigitavelBusca = document.querySelector(".filtro");

    campoDigitavelBusca.addEventListener("input", () => {

        var camposDeBusca = document.querySelectorAll(".textos");

        if(campoDigitavelBusca.value.length > 0){

            camposDeBusca.forEach((elemento, indice) => {

                let conteudoTitulo = elemento.querySelector("p").textContent;
                let conteudoTexto = elemento.querySelector("h4").textContent;

                let conteudoTotal = conteudoTitulo.concat(conteudoTexto);

                console.log(conteudoTotal)

                let expressao = new RegExp(campoDigitavelBusca.value, "i")

                if(expressao.test(conteudoTotal)){
                    elemento.parentNode.classList.remove("invisivel");
                   
                }else{

                    elemento.parentNode.classList.add("invisivel");
                }
            })
        }else{
            camposDeBusca.forEach(elemento => {
                
                elemento.parentNode.classList.remove("invisivel");
            })
        }
    })



// Eventos

/* document.querySelector(".nav__botao-editar").addEventListener("click", ()=>{
   
   
}) */

document.querySelector(".botao-cancelar").addEventListener("click" ,()=>{
    var campoInformacoes = document.querySelector("[data-mensagem]");
    campoInformacoes.value = "";

    const areaDeAviso = document.querySelector(".aviso")
        .classList.remove("visualiza-aviso");
    

    campoInformacoes.classList.remove("borda-vermelha");

    var campoTitulo = document.querySelector("[data-titulo]");
    campoTitulo.value = ""

    document.querySelector('.menu-deslizante').classList.toggle('menu-deslizante--ativo')
    document.querySelector('.botao-adicionar').classList.toggle('apaga-botao');
});

document.querySelector(".botao-salvar").addEventListener("click", ()=>{
    const temMensagem = document.getElementById("mensagem");
    const areaDeAviso = document.querySelector(".aviso");
    console.log(temMensagem)
    if(temMensagem.value.length > 0){

        document.querySelector('.menu-deslizante').classList.toggle('menu-deslizante--ativo')

        document.querySelector('.botao-adicionar').classList.toggle('apaga-botao');

        temMensagem.classList.remove("borda-vermelha");
        areaDeAviso.classList.remove("visualiza-aviso");

        pegarDados()
    }else{
        temMensagem.classList.add("borda-vermelha");
        areaDeAviso.classList.add("visualiza-aviso");
    }


});


document.querySelector('.botao-adicionar').addEventListener('click', () => {

    document.querySelector('.menu-deslizante').classList.toggle('menu-deslizante--ativo')
    document.querySelector('.botao-adicionar').classList.toggle('apaga-botao');
});



document.querySelector(".botao-editar").addEventListener("click", ()=>{

    const temMensagem = document.getElementById("mensagem-editada");
    const areaDeAvisoEditar = document.querySelector(".aviso-editar");

    if(temMensagem.value.length > 0){

        document.querySelector('.nav-deslizante').classList.toggle('nav-deslizante--ativo');
        document.querySelector('.botao-adicionar').classList.toggle('apaga-botao');

        temMensagem.classList.remove("borda-vermelha");
        areaDeAvisoEditar.classList.remove("visualiza-aviso");

        salvarEdicao()
    }else{
        temMensagem.classList.add("borda-vermelha");
        areaDeAvisoEditar.classList.add("visualiza-aviso");
    }
    
})


criaBancoDeDados();




