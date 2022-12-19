/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core')

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speakOutput = 'Seja bem vindo ao Mestre Sabe, pergunte qualquer coisa'

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .addElicitSlotDirective('askme', 'AskMeIntentHandler')
      .getResponse()
  }
};

      // && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskMeIntent'
const AskMeGetValueIntentHandler = {
  canHandle(handlerInput) {
    return (
        Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        || Alexa.getRequestType(handlerInput.requestEnvelope) === 'LauncherRequest'
    )
      && !handlerInput.requestEnvelope.request.intent.slots.askme.value
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Pergunte o que quiser')
      .reprompt()
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
    const { Configuration, OpenAIApi } = require("openai")
    const configuration = new Configuration({
      apiKey: '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',
    });
    const openai = new OpenAIApi(configuration)

    const query = handlerInput.requestEnvelope.request.intent.slots.askme.value

    // function askOpenAi, retorna a resposta da openAI
    const askOpenAi = async (query) => {
      try {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: query,
          temperature: 0.7,
          max_tokens: 500,
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
    // fim function

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
      .getResponse()
  }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
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
    .lambda();
