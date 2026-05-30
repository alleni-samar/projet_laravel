import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');

    // Load history from database on mount
    useEffect(() => {
        if (!token) return;
        
        const fetchHistory = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/chatbot/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.status === 'success') {
                    const dbHistory = response.data.history;
                    if (dbHistory && dbHistory.length > 0) {
                        setHistory(dbHistory);
                    } else {
                        initializeDefaultHistory();
                    }
                }
            } catch (err) {
                console.error("Erreur de récupération de l'historique du chatbot:", err);
                initializeDefaultHistory();
            }
        };

        fetchHistory();
    }, [token]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    const initializeDefaultHistory = () => {
        const welcomeMessage = {
            role: 'bot',
            message: "Bonjour ! Je suis FlyHigh Bot, votre assistant virtuel intelligent. ✈️\n\nComment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions comme :\n• \"Quels sont mes vols réservés ?\"\n• \"Quels vols partent pour Nice ?\"\n• \"Quel est le vol le plus populaire ?\"\n• \"Y a-t-il des places libres sur le vol AF-1042 ?\"",
            timestamp: new Date().toISOString()
        };
        setHistory([welcomeMessage]);
    };

    if (!token) {
        return null; // Hide chatbot if user is not authenticated
    }

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg = message.trim();
        setMessage('');

        const newUserMessage = {
            role: 'user',
            message: userMsg,
            timestamp: new Date().toISOString()
        };

        // Add user message to state
        setHistory(prev => [...prev, newUserMessage]);
        setLoading(true);

        try {
            // Call API endpoint (no need to send history, backend loads it from DB)
            const response = await axios.post('http://localhost:8000/api/chatbot', {
                message: userMsg
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status === 'success') {
                const botReply = {
                    role: 'bot',
                    message: response.data.reply,
                    timestamp: new Date().toISOString()
                };
                setHistory(prev => [...prev, botReply]);
            }
        } catch (err) {
            console.error(err);
            setHistory(prev => [
                ...prev, 
                {
                    role: 'bot',
                    message: "⚠️ Désolé, je rencontre des difficultés pour me connecter au serveur de FlyHigh. Veuillez vérifier votre connexion ou réessayer plus tard.",
                    timestamp: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm("Voulez-vous réinitialiser l'historique de la conversation ? Cela videra l'historique de la base de données.")) {
            try {
                await axios.delete('http://localhost:8000/api/chatbot/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                initializeDefaultHistory();
            } catch (err) {
                console.error("Erreur lors de la réinitialisation de l'historique:", err);
                alert("Impossible de réinitialiser l'historique sur le serveur. Veuillez réessayer.");
            }
        }
    };

    return (
        <div className="chatbot-wrapper">
            {/* Floating Chat Button */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="chatbot-btn" title="Besoin d'aide ?">
                    <span className="chatbot-icon">💬</span>
                    <span className="chatbot-btn-text">Assistant FlyHigh</span>
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">🤖</div>
                            <div>
                                <h4 className="chatbot-title">FlyHigh Bot</h4>
                                <span className="chatbot-subtitle">Assistant Voyage Virtuel</span>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button 
                                onClick={handleClearHistory} 
                                className="chatbot-action-btn" 
                                title="Réinitialiser la discussion"
                            >
                                🔄
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="chatbot-close-btn" 
                                title="Fermer la fenêtre"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="chatbot-messages">
                        {history.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`chatbot-msg-row ${msg.role === 'user' ? 'user' : 'bot'}`}
                            >
                                {msg.role !== 'user' && <div className="chatbot-msg-avatar">🤖</div>}
                                <div className={`chatbot-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
                                    <p className="chatbot-msg-text">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chatbot-msg-row bot">
                                <div className="chatbot-msg-avatar">🤖</div>
                                <div className="chatbot-loader-bubble">
                                    <span className="chatbot-loader-dot"></span>
                                    <span className="chatbot-loader-dot"></span>
                                    <span className="chatbot-loader-dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Form */}
                    <form onSubmit={handleSend} className="chatbot-footer">
                        <input
                            type="text"
                            placeholder="Posez votre question..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                            className="chatbot-input"
                            maxLength={800}
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !message.trim()} 
                            className={`chatbot-send-btn ${message.trim() && !loading ? 'active' : ''}`}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chatbot;
