import { useState, useEffect, useRef } from "react";
import { usePuterStore } from "~/libs/puter";

const Chat = () => {
    const { auth, ai } = usePuterStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [ inputValue, setInputValue ] = useState("");
    const [ aiReady, setAiReady ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Check AI Ready in Puter Stor
        console.log("AI starting to initialize..."+ auth.isAuthenticated);
        
        const checkReady = setInterval(() => {
            if (auth.isAuthenticated) {
                console.log("AI is ready");
                setAiReady(true);
                clearInterval(checkReady);
            }
        }, 300)
        return () => clearInterval(checkReady);
    }, [auth])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const normalizeMessage = (m: any, defaultRole: "assistant" | "user" | "system" = "assistant"): ChatMessage => {
        if (typeof m === "string") return { role: defaultRole, content: m };
        if (!m || typeof m !== "object") return { role: defaultRole, content: String(m ?? "") };
        // already a ChatMessage-shaped object
        if ("role" in m && (m.role === "user" || m.role === "assistant" || m.role === "system")) {
            return { role: m.role, content: m.content ?? String(m.content ?? "") };
        }
        // handle alternate shapes like { content, isUser, id, data }
        const isUser = Boolean(m.isUser);
        const content = m.content ?? m.data ?? (typeof m === "object" ? JSON.stringify(m) : String(m));
        return { role: isUser ? "user" : defaultRole, content };
    };

    const addMessages = (msg: string | ChatMessage, isUser?: boolean) => {
        setMessages((prev) => [
            ...prev,
            normalizeMessage(msg, isUser ? "user" : "assistant"),
        ]);
    };

    const sendMessage = async () => {
        const message = inputValue.trim();
        if (!message) return;

        if (!aiReady) {
            addMessages("⏳ AI Assistant is not ready yet. Please wait a moment...", false);
            return;
        }

        addMessages(message, true);
        setInputValue("");
        setIsLoading(true);

        try {

            const response = await ai.chat([
                ...messages.map(m => ({
                    role: m.role as "user" | "assistant" | "system",
                    content: m.content
                })),
                { role: "user", content: message }
            ]);  
            
            const reply = typeof response === "string"
                ? response
                : response?.message?.content || "🤖 I'm sorry, I didn't get that.";

            addMessages(Array.isArray(reply) ? reply.join(" ") : reply, false);

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg = (error && typeof error === "object" && "message" in error)
                ? (error as { message?: string }).message
                : undefined;
            addMessages(`❌ Error: ${errorMsg || "An error occurred while sending your message. Please try again."}`, false);
        } finally {
            setIsLoading(false);
        }
    }

    // key press enter to send message
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    return (
        <>
            { aiReady ? 
                (
                    <div className="bg-transparent flex items-center justify-center p-4">

                            <div
                                id="chatContainer"
                                className="bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col"
                            >
                                <header className="bg-white border-b border-gray-200 p-4 rounded-t-lg">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            id="agentAvatar"
                                            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"
                                        >

                                            <svg
                                                className="w-6 h-6 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >

                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                            </svg>
                                        </div>  
                                        <div>

                                            <h2 id="agentNameDisplay" className="font-semibold text-gray-900">
                                                AI Assistant
                                            </h2>
                                            <p className="text-sm text-green-500">● Online &amp; Ready to Help</p>
                                        </div>
                                    </div>
                                </header>

                                <div
                                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                                    id="messagesContainer"
                                >



                                    <div className="flex items-start content-center space-x-3">
                                            <div
                                                id="welcomeAvatar"
                                                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                                            >
                                                
                                                <svg
                                                    className="w-4 h-4 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    
                                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                                </svg>
                                            </div>
                                            <div className="max-w-xs lg:max-w-md">
                                                
                                                <div className="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm border border-gray-100">
                                                    
                                                    <p id="welcomeMessage" className="text-gray-800 text-sm">
                                                        Hello! I'm your AI assistant. How can I help you today?
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 ml-1" id="welcomeTime" />
                                            </div>

                                    </div>

                                    { messages.map((msg,index) => (
                                        msg.role === "user" ? (
                                            <div key={index} className="flex items-start content-center space-x-3 space-x-reverse flex-row-reverse">
                                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-medium">USER</span>
                                                </div>
                                                <div className="max-w-xs lg:max-w-md">
                                                    <div className="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm border border-gray-100">
                                                        <p className="text-gray-800 text-sm">
                                                            {Array.isArray(msg.content)
                                                                ? msg.content.map(c => c.text ?? (typeof c === 'string' ? c : JSON.stringify(c))).join(' ')
                                                                : msg.content}
                                                        </p>
                                                    </div>
                                                    {/* <p className="text-xs text-gray-500 mt-1">2:32 PM</p> */}
                                                </div>
                                            </div>
                                        ) : (
                                                 <div className="flex items-start content-center space-x-3">
                                                <div
                                                    id="welcomeAvatar"
                                                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                                                >
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >

                                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                                    </svg>
                                                </div>
                                                    <div className="max-w-xs lg:max-w-md">

                                                        <div className="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm border border-gray-100">

                                                            <p id="welcomeMessage" className="text-gray-800 text-sm">
                                                                {Array.isArray(msg.content)
                                                                    ? msg.content.map(c => c.text ?? (typeof c === 'string' ? c : JSON.stringify(c))).join(' ')
                                                                    : msg.content}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 ml-1" id="welcomeTime" />
                                                    </div>

                                                </div>
                                        )
                                    ))}
                                    
                                    <div ref={messagesEndRef} />

                                    {/* 
                                    Outgoing Message 
                                    <div className="flex items-start space-x-3 justify-end">
                                        <div className="max-w-xs lg:max-w-md">
                                            <div className="bg-blue-500 rounded-2xl rounded-tr-md p-3 shadow-sm">
                                                <p className="text-white text-sm">
                                                    It was a web application using React and Tailwind CSS. Really happy
                                                    with how it turned out!
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 mr-1 text-right">2:33 PM</p>
                                        </div>
                                    </div> 
                                    */}

                                </div>

                                <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
                                    
                                    <div className="flex items-center space-x-3">
                                        
                                        <button 
                                            onClick={sendMessage}
                                            disabled={isLoading||!inputValue.trim()}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                            
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                />
                                            </svg>
                                        </button>
                                        <div className="flex-1 relative">
                                            
                                            <input
                                                type="text"
                                                placeholder="Type your message..."
                                                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                id="messageInput"

                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                disabled={isLoading}
                                            />

                                            { isLoading && (
                                                <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">Thinking</p>
                                            )}
                                            
                                        </div>
                                        <button
                                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                                        >
                                            
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                    </div>
                ) : (
                    <div className="flex items-center justify-center h-96">
                        <p className="text-gray-500">Please log in to access the chat.</p>
                    </div>
                )
            }
        </>
    )
}

export default Chat