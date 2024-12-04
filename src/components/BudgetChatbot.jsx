import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import '../styles/projects/chatbot.css';

import { TextToSpeech } from './TextToSpeech';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

const ChatMessage = ({ message, onOptionSelect }) => (
    <div className={`budget-chatbot-message ${message.isBot ? 'bot' : 'user'}`}>
        <div className={`budget-chatbot-bubble ${message.isBot ? 'bot' : 'user'}`}>
            {/* Text-to-Speech for Bot Messages */}
            {message.isBot && message.content && (
                <TextToSpeech text={message.content} />
            )}
            <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
            {message.options && (
                <div className="budget-chatbot-options">
                    {message.options.map((option, index) => (
                        <button
                            key={index}
                            className="budget-chatbot-option-button"
                            onClick={() => onOptionSelect(option)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
            {/* {message.analysis && (
                <div className="budget-chatbot-analysis">
                    <div className="budget-comparison">
                        <h4>Analyse Budgétaire</h4>
                        {Object.entries(message.analysis).map(([category, details]) => (
                            <div key={category} className="budget-category">
                                <h5>{category}</h5>
                                <ReactMarkdown>{details}</ReactMarkdown>
                            </div>
                        ))}
                    </div>
                </div>
            )} */}
        </div>
    </div>
);

const BudgetChatbot = ({ projectWorks }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [messages, setMessages] = useState([]);
    const [selectedWork, setSelectedWork] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [conversationState, setConversationState] = useState('initial');

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Initial greeting with work options
            const workOptions = projectWorks.map(work => ({
                label: work.nom_ouvrage,
                value: work.id,
                data: work
            }));

            setMessages([
                {
                    id: 1,
                    content: "Bonjour ! Quel ouvrage souhaitez-vous optimiser aujourd'hui ?",
                    isBot: true,
                    options: workOptions,
                    timestamp: new Date()
                }
            ]);
        }
    }, [isOpen, projectWorks]);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsAnimating(false);
            // Reset state when closing
            setMessages([]);
            setSelectedWork(null);
            setSelectedTask(null);
            setConversationState('initial');
        }, 250);
    };

    const generateGeminiPrompt = (task, work) => {
        return `En tant qu'expert en construction, analysez la tâche suivante et proposez des optimisations budgétaires détaillées:

Ouvrage: ${work.nom_ouvrage}
Tâche: ${task.nom_tache}
Description: ${task.description_tache || 'Non spécifiée'}

Budget prévisionnel:
- Main d'œuvre: ${task.budget_previsionnel.mo}€
- Matériaux: ${task.budget_previsionnel.materiaux}€
- Matériels: ${task.budget_previsionnel.materiels}€
- Sous-traitance: ${task.budget_previsionnel.sous_traitance}€

Proposez des optimisations concrètes pour chaque poste de dépense en détaillant:
1. Main d'œuvre: nombre optimal de compagnons et organisation du travail
2. Matériaux: choix et quantités optimales
3. Matériels: besoins en équipements et durée d'utilisation
4. Sous-traitance: pertinence et alternatives possibles

Donnez une estimation réaliste des coûts optimisés pour chaque poste.`;
    };

    const analyzeWithGemini = async (task, work) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = generateGeminiPrompt(task, work);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Erreur lors de l\'analyse Gemini: ', error);
            return "Une erreur est survenue lors de l'analyse. Veuillez réessayer.";
        }
    };

    const handleOptionSelect = async (option) => {
        const userMessage = {
            id: messages.length + 1,
            content: option.label,
            isBot: false,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        if (conversationState === 'initial') {
            // User selected a work
            const selectedWork = projectWorks.find(w => w.id === option.value);
            setSelectedWork(selectedWork);
            setConversationState('selectingTask');

            const taskOptions = selectedWork.taches.map(task => ({
                label: task.nom_tache,
                value: task.id,
                data: task
            }));

            const botResponse = {
                id: messages.length + 2,
                content: `Voici les tâches disponibles pour l'ouvrage "${selectedWork.nom_ouvrage}". Laquelle souhaitez-vous optimiser ?`,
                isBot: true,
                options: taskOptions,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);

        } else if (conversationState === 'selectingTask') {
            // User selected a task
            setSelectedTask(option.data);
            setConversationState('analyzing');

            const loadingMessage = {
                id: messages.length + 2,
                content: "Analyse en cours...",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, loadingMessage]);

            const analysis = await analyzeWithGemini(option.data, selectedWork);

            const analysisMessage = {
                id: messages.length + 3,
                content: analysis,
                isBot: true,
                timestamp: new Date(),
                analysis: {
                    "Main d'œuvre": /Main d'œuvre:\s*(.+?)(?:€|\n|$)/.exec(analysis)?.[1]?.trim() || "Non spécifié",
                    "Matériaux": /Matériaux:\s*(.+?)(?:€|\n|$)/.exec(analysis)?.[1]?.trim() || "Non spécifié",
                    "Matériels": /Matériels:\s*(.+?)(?:€|\n|$)/.exec(analysis)?.[1]?.trim() || "Non spécifié",
                    "Sous-traitance": /Sous-traitance:\s*(.+?)(?:€|\n|$)/.exec(analysis)?.[1]?.trim() || "Non spécifié"
                }
            };

            console.log("Gemini Analysis Response:", analysis);


            setMessages(prev => [
                ...prev.slice(0, -1), // Remove loading message
                analysisMessage
            ]);

            // Add option to start over
            const newAnalysisMessage = {
                id: messages.length + 4,
                content: "Souhaitez-vous analyser une autre tâche ?",
                isBot: true,
                options: [{
                    label: "Oui, choisir un autre ouvrage",
                    value: "restart",
                    action: "restart"
                }],
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newAnalysisMessage]);
        } else if (option.action === "restart") {
            // Reset the conversation
            setMessages([]);
            setSelectedWork(null);
            setSelectedTask(null);
            setConversationState('initial');

            // Trigger initial message
            const workOptions = projectWorks.map(work => ({
                label: work.nom_ouvrage,
                value: work.id,
                data: work
            }));

            setMessages([{
                id: 1,
                content: "Bonjour ! Quel ouvrage souhaitez-vous optimiser aujourd'hui ?",
                isBot: true,
                options: workOptions,
                timestamp: new Date()
            }]);
        }
    };

    return (
        <div className="budget-chatbot-container">
            {!isOpen && !isAnimating && (
                <div className="budget-chatbot-button">
                    <button
                        className="budget-chatbot-icon"
                        onClick={handleOpen}
                    >
                        <MessageCircle />
                    </button>
                </div>
            )}

            {(isOpen || isAnimating) && (
                <div className={`budget-chatbot-window ${isAnimating ? 'exiting' : 'entering'}`}>
                    <div className="budget-chatbot-header">
                        <h2 className="budget-chatbot-title">Optimisation Budgétaire</h2>
                        <button
                            className="budget-chatbot-close"
                            onClick={handleClose}
                        >
                            <X />
                        </button>
                    </div>

                    <div className="budget-chatbot-messages">
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onOptionSelect={handleOptionSelect}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetChatbot;