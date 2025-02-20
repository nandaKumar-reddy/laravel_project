class MessageParser {
    constructor(actionProvider) {
      this.actionProvider = actionProvider;
    }
  
    parse(message) {
      // Forward the user message to the ActionProvider to process it
      this.actionProvider.handleUserMessage(message);
    }
  }
  
  export default MessageParser;
  