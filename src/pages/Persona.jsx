import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import { GoogleGenAI } from '@google/genai';
import { Bot, Send } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const Persona = ({ context }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hey there mySelf ${context[0].id}. Ask me anything ✨`,
    },
  ]);

  const bottomRef = useRef(null);

  const systemPrompt = `You are an AI persona whose name is ${context[0].id}. You are a teacher by profession. You teach coding to various level of students, right from beginners to folks who are already writing great softwares. use the following information to answer the user queries. ${context[0].tuning} ${context[0].About}
  Only give the information only related to context provided.
  Example:
  User: How to learn coding?
  AI: You can learn coding by following the steps mentioned in the context.
  User: What is your name?
  AI: My name is ${context[0].id}. I am a teacher by profession. I teach coding to various level of students, right from beginners to folks who are already writing great softwares.
  User: Hello?
  AI: Hey there mySelf ${context[0].id}. I am here to help you with your queries. Ask me anything ✨
  `;

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      console.log("Api key",GEMINI_API_KEY);
      
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [
          { text: input, role: 'user' },
          { text: systemPrompt, role: 'system' },
        ],
        maxTokens: 100,
        temperature: 0.5,
      });

      // Add delay for smoother effect
      await new Promise((res) => setTimeout(res, 1000));

      const aiReply = { sender: 'ai', text: response.text };
      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const Message = ({ sender, text }) => {
    const isUser = sender === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div
            className={`rounded-full w-9 h-9 flex items-center justify-center ${
              isUser ? 'bg-blue-600' : 'bg-green-500'
            } text-white`}
          >
            {isUser ? 'U' : <Bot size={18} />}
          </div>
          <div
            className={`max-w-xs md:max-w-md p-3 rounded-xl ${
              isUser ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'
            }`}
          >
            {text}
          </div>
        </div>
      </div>
    );
  };

  // Auto-scroll to bottom on new messages or loading
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-white flex flex-col">
      <header className="bg-white shadow-md p-4 text-center text-xl font-semibold text-purple-700">
        AI Persona Chat
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((msg, idx) => (
          <Message key={idx} sender={msg.sender} text={msg.text} />
        ))}

        {/* Loader bubble */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 text-white rounded-full w-9 h-9 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="bg-gray-200 text-left p-3 rounded-xl max-w-xs md:max-w-md animate-pulse">
                Thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </main>

      <footer className="p-4 bg-white shadow-inner flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full"
        >
          <Send size={18} />
        </button>
      </footer>
    </div>
  );
};

export default Persona;
