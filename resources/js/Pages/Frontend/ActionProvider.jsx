import axios from 'axios';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  async handleQueryFromAPI(query) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions', // Groq API endpoint
        {
          model: "llama3-8b-8192", // Groq model or adjust based on Groq's model names
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: query } // The user's query
          ],
          max_tokens: 1024, // Adjust as necessary
          temperature: 1, // Adjust for randomness
        },
        {
          headers: {
            "Authorization": `Bearer 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`, // Use your Groq API key here
            "Content-Type": "application/json",
          },
        }
      );

      // Ensure the response structure is correct from the Groq API
      const botResponse = response.data.choices[0].message.content.trim();
      this.handleBotResponse(botResponse);
    } catch (error) {
      console.error("Error calling API:", error);
      this.handleBotResponse("I'm sorry, I couldn't process your request at the moment.");
    }
  }

  handleBotResponse(responseText) {
    const message = this.createChatBotMessage(responseText);
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }

  handleUserMessage(query) {
    this.handleQueryFromAPI(query); // Send the user query to the Groq API
  }
}

export default ActionProvider;
