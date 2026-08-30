import axios from "axios";
import type { Message } from "./types";

// Retrieve the RAG API URL from environment variables, defaulting to port 8000
const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || "http://localhost:8000";

/**
 * Sends a chat message to the Python FastAPI RAG Assistant and retrieves the response.
 * Uses the API URL defined in VITE_RAG_API_URL.
 *
 * @param messageText - The current message from the user
 * @param _chatHistory - The array of previous messages in the current session
 * @returns The assistant's response string
 */
export async function sendChatMessage(
  messageText: string,
  _chatHistory: Message[],
  userId?: string,
): Promise<string> {
  const trimmed = messageText.trim();
  if (!trimmed) {
    return "Please enter a valid message.";
  }

  try {
    const response = await axios.post(
      `${RAG_API_URL}/chat`,
      {
        message: trimmed,
        user_id: userId || "anonymous",
      },
      { timeout: 15000 }, // 15 seconds timeout
    );

    if (response.data && typeof response.data.answer === "string") {
      return response.data.answer;
    }

    return "Received an invalid response format from the AI Assistant.";
  } catch (error: any) {
    console.error("RAG API Call Failed:", error);

    // 1. Network level error (server is offline or port blocked)
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "The AI assistant is currently offline. Please ensure the Python RAG service is running on Port 8000 (run `python app.py` from the `rag` folder).";
    }

    // 2. Server returned a status code outside 2xx (e.g. 503, 500, 400)
    const status = error.response.status;
    const detail = error.response.data?.detail;

    if (status === 503) {
      return "RAG AI service is starting up or has a missing API configuration (e.g. MISTRAL_API_KEY). Please confirm your `.env` values.";
    }

    if (detail) {
      return `AI Response Error: ${detail}`;
    }

    return `An internal error occurred (Status ${status}) while obtaining the AI response. Please try again.`;
  }
}
