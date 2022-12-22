/* *
 * Mestre Sabe
 *
 * Desenvolvido por: 
 *
 *    Fábio Berbert de Paula <sou@mestrefabio.com>
 *    Instagram: @alexabolada
 *
 *
 * */
const Alexa = require('ask-sdk-core')
const { askOpenAi } = require('./functions')

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speakOutput = 'Seja bem vindo ao Mestre Sabe, pergunte qualquer coisa'

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  }
}

const AskMeGetValueIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskMeIntent'
      && !handlerInput.requestEnvelope.request.intent.slots.askme.value
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Faça uma pergunta')
      .reprompt('Faça uma pergunta')
      .addElicitSlotDirective('askme')
      .getResponse()
  }
}

const AskMeIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskMeIntent'
      && handlerInput.requestEnvelope.request.intent.slots.askme.value
  },
  async handle(handlerInput) {

    const query = handlerInput.requestEnvelope.request.intent.slots.askme.value
    // sair se responder não
    if ( query.match(/(não|no|nao)/) && query.length < 5 ) {
      return handlerInput.responseBuilder
        .speak('Até a próxima!')
        .getResponse()
    }

    const speakOutput = await askOpenAi(query)

    return handlerInput.responseBuilder
      .speak(speakOutput.replace(/^[^a-zA-Z0-9]*/, ''))
      .reprompt('Mais algum pedido?')
      .withShoudEndSession(true)
      .getResponse()
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
  },
  handle(handlerInput) {
    const speakOutput = 'Pergunte ou fale qualquer coisa e eu usarei minhas habilidades em conhecimentos gerais para responder.'

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  }
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
  },
  handle(handlerInput) {
    const speakOutput = 'Até a próxima!'

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse()
  }
}

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
  },
  handle(handlerInput) {
    const speakOutput = 'Não sei nada sobre isso. Tente novamente.'

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`)
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse() // notice we send an empty response
  }
}

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope)
    const speakOutput = `Você ativou a intent ${intentName}`

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse()
  }
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    const speakOutput = 'Ops, ocorreu um problema durante a execução dessa rotina.'
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`)

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse()
  }
}

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AskMeIntentHandler,
    AskMeGetValueIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler)
  .addErrorHandlers(
    ErrorHandler)
  .withCustomUserAgent('sample/hello-world/v1.2')
  .lambda()
