// function askOpenAi, retorna a resposta da openAI
const askOpenAi = async (query) => {
  try {
    const { Configuration, OpenAIApi } = require("openai")
    const configuration = new Configuration({
      apiKey: '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',
    })
    const openai = new OpenAIApi(configuration)

    query = `
      ${query}. Seja o mais objetivo possível, produzindo 
      uma resposta de no máximo 100 palavras
      `
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: query,
      temperature: 1,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    })

    if ( response.data.choices.length === 0 )
      return 'Estou com preguiça de responder essa pergunta'
    else
      return response.data.choices[0].text

  } catch (err) {
    return 'Estou com preguiça de responder essa pergunta'
  }
}

module.exports = { askOpenAi }
