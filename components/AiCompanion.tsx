import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { sendMessageToCompanion, analyzeUploadedImage, generateSpeechFromText } from '../services/geminiService';

const AiCompanion: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial soothing message
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: MessageRole.MODEL,
        text: "Hi there. I'm here to listen, help you organize your thoughts, or just chat. How are you holding up today?",
        sources: []
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input,
      imageUrl: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      let sources: Array<{title: string, uri: string}> = [];

      if (selectedImage && imagePreview) {
        // Handle Image Analysis (Gemini 3 Pro Preview)
        // Convert Base64 to exclude the "data:image/..." prefix
        const base64Data = imagePreview.split(',')[1];
        const mimeType = selectedImage.type;
        responseText = await analyzeUploadedImage(base64Data, mimeType, userMsg.text);
      } else {
        // Handle Text/Search Chat (Gemini 2.5 Flash)
        // Convert messages to history format
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        
        const result = await sendMessageToCompanion(userMsg.text, history);
        responseText = result.text;
        sources = result.sources;
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        sources: sources
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
      clearImage();
    }
  };

  const playMessageAudio = async (text: string, messageId: string) => {
     // Mark this message as playing
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioPlaying: true } : m));

    try {
      const audioBuffer = await generateSpeechFromText(text);
      if (audioBuffer) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        source.onended = () => {
             setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioPlaying: false } : m));
        };
      } else {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioPlaying: false } : m));
      }
    } catch (error) {
       console.error(error);
       setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioPlaying: false } : m));
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[600px] md:h-auto">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-teal-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-700">Compassionate Companion</h3>
          <p className="text-xs text-slate-400">Powered by Gemini • Private & Safe</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === MessageRole.USER 
                ? 'bg-teal-500 text-white rounded-tr-sm' 
                : 'bg-slate-50 text-slate-700 rounded-tl-sm border border-slate-100'
            }`}>
              {msg.imageUrl && (
                 <img src={msg.imageUrl} alt="User upload" className="mb-2 rounded-lg max-h-48 object-cover" />
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {/* Grounding Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Sources:</p>
                  <ul className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <li key={idx}>
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-colors block truncate max-w-[150px]"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TTS Button for Model Messages */}
              {msg.role === MessageRole.MODEL && (
                 <button 
                  onClick={() => playMessageAudio(msg.text, msg.id)}
                  className={`mt-2 p-1.5 rounded-full hover:bg-slate-200/50 transition-colors ${msg.isAudioPlaying ? 'text-teal-500' : 'text-slate-400'}`}
                  title="Read aloud"
                 >
                   {msg.isAudioPlaying ? (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 animate-pulse">
                         <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                         <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                       </svg>
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                       <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                       <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                     </svg>
                   )}
                 </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-sm flex gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        {imagePreview && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 rounded-lg inline-flex">
            <img src={imagePreview} alt="Preview" className="w-10 h-10 rounded object-cover" />
            <button onClick={clearImage} className="text-slate-400 hover:text-red-400">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
           <input 
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
            title="Upload photo"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or message here..."
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-teal-200 placeholder:text-slate-400"
          />
          
          <button 
            type="submit" 
            disabled={(!input && !selectedImage) || isLoading}
            className={`p-3 rounded-xl transition-all ${
              (!input && !selectedImage) || isLoading
               ? 'bg-slate-100 text-slate-300' 
               : 'bg-teal-500 hover:bg-teal-600 text-white shadow-md'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCompanion;
