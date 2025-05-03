import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! How can I help you today?' }]);
  const [input, setInput] = useState('');
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const userMsg = { role: 'user', content: input};
  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [{
      role :'system',
      content :'You are a helpful assistant that tends to users needs.You also help them to navigate through the web app.The web app is a blockchain based supply chain management system.Assume user has no tech experience.Use a friendly tone.'},
      ...messages,
      userMsg
    ];
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const response = await axios.post(
        import.meta.env.VITE_GROQ_API_LINK,
        {
          model: 'llama3-70b-8192', 
          messages: newMessages,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = response.data.choices[0].message;
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl flex flex-col h-[600px] overflow-hidden border border-gray-200">
        
        {/* Chat header */}
        <div className="bg-teal-600 text-white text-lg font-semibold px-4 py-3">
          🤖 Chat with Assistant
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <span className="block text-sm font-medium mb-1">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className="text-sm">{msg.content}</span>
              </div>
            </div>
          ))}
        </div>
  
        {/* Input area */}
        <div className="p-4 border-t bg-white flex items-center space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={sendMessage}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default Chatbot;
