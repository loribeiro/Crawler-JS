const retrieveInformationHtml = require("./retrieveInformationHtml")
const Nightmare =  require("nightmare")


function crawlTJAL(code){

    async function executeRequisition(url, firstPartCode, secondPartCode, instance){
        return await new Promise(async function(resolve, reject){
            const nightmare = new Nightmare({show: false})
            await nightmare
                     .goto(url)
                     .wait("#linhaProcessoUnificado")
                     .insert("#numeroDigitoAnoUnificado", firstPartCode)
                     .insert("#foroNumeroUnificado", secondPartCode)
                     .click(instance === 1 ? "#pbEnviar" : "#botaoPesquisar")
                     .wait(2000)
                     .evaluate(() => document.querySelector("body").innerHTML)
                     .end()
                     .then(doc =>{
                         const chaves = retrieveInformationHtml(doc,instance === 1 ? 1 : 2)
                         resolve(chaves)
                     })
                     .catch(error => {
                         resolve({
                            "erro": "Ocorreu um erro ao buscar a informação, por favor tente novamente"
                         })
                     })
         })
    }

    async function secondInstance(codeBreaked){
        const url = "https://www2.tjal.jus.br/cposg5/open.do"
        const firstPartCode = codeBreaked[0]
        const secondPartCode = codeBreaked[1]

        return await executeRequisition(url, firstPartCode, secondPartCode, 2)
    }

    async function firstInstance(codeBreaked){
        const url = "https://www2.tjal.jus.br/cpopg/open.do"
        const firstPartCode = codeBreaked[0]
        const secondPartCode = codeBreaked[1]
        return await executeRequisition(url, firstPartCode, secondPartCode, 1)

    }
    
    async function execute(){
        const pattern  = /^\d{7}-\d{2}.\d{4}.\d{1}.\d{2}.\d{4}$/
        if(pattern.test(code)){
            const codeBreaked = code.split(".8.02.")

            const result = await Promise.all([
                firstInstance(codeBreaked),
                secondInstance(codeBreaked)
            ]).catch(err=>console.log(err))
           
            return {
                "primeira instancia": await result[0],
                "segunda instancia": await result[1]
            }
        }else{
            return {
                "erro": "codigo no formato errado, deve estar no formato: NNNNNNN-DD.AAAA.J.TR.OOOO"
            }
        } 
    }

    return execute().catch(err=>console.log(err))
}

module.exports = crawlTJAL;

/* async function teste2(){
    const t = await crawlTJAL("0037530-87.2012.8.02.0001")
    console.log(t)
}
teste2() */
