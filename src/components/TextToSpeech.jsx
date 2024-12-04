import { Volume2, Pause, StopCircle } from "lucide-react";
import { useState, useEffect } from "react";

useState

// Custom function to strip markdown syntax
const stripMarkdown = (text) => {
    if (!text) return '';

    // Remove bold and italic markers
    text = text.replace(/(\*{1,2}|_{1,2})(.*?)\1/g, '$2');

    // Remove links
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // Remove code blocks and inline code
    text = text.replace(/(`{1,3})([^`]+)\1/g, '$2');

    // Remove headers
    text = text.replace(/^#+\s+/gm, '');

    // Remove blockquotes
    text = text.replace(/^\s*>\s*/gm, '');

    // Remove horizontal rules
    text = text.replace(/^[-*_]{3,}\s*$/gm, '');

    // Trim excess whitespace
    text = text.trim();

    return text;
};

export const TextToSpeech = ({ text }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [utterance, setUtterance] = useState(null);
    const [plainText, setPlainText] = useState('');

    useEffect(() => {
        // Strip markdown syntax
        const strippedText = stripMarkdown(text);
        setPlainText(strippedText);
    }, [text]);

    useEffect(() => {
        if (!plainText) return;

        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(plainText);

        // Set French language for better pronunciation
        u.lang = 'fr-FR';

        u.onstart = () => setIsPlaying(true);
        u.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        setUtterance(u);

        return () => {
            synth.cancel();
        };
    }, [plainText]);

    const handlePlay = () => {
        const synth = window.speechSynthesis;

        if (isPaused) {
            synth.resume();
            setIsPaused(false);
        } else {
            synth.speak(utterance);
        }
    };

    const handlePause = () => {
        const synth = window.speechSynthesis;
        synth.pause();
        setIsPaused(true);
    };

    const handleStop = () => {
        const synth = window.speechSynthesis;
        synth.cancel();
        setIsPaused(false);
        setIsPlaying(false);
    };

    // Only render TTS controls if there's text
    if (!plainText) return null;

    return (
        <div className="budget-chatbot-tts-controls">
            <button
                onClick={handlePlay}
                className={`budget-chatbot-tts-button ${isPlaying && !isPaused ? 'active' : ''}`}
            >
                <Volume2 size={20} />
            </button>
            <button
                onClick={handlePause}
                className={`budget-chatbot-tts-button ${isPaused ? 'active' : ''}`}
                disabled={!isPlaying}
            >
                <Pause size={20} />
            </button>
            <button
                onClick={handleStop}
                className="budget-chatbot-tts-button"
                disabled={!isPlaying}
            >
                <StopCircle size={20} />
            </button>
        </div>
    );
};
