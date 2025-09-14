/**
 * AI Fairy Chat Voice Integration
 * This script integrates the AI Fairy voice system with the main chat components
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useLogger } from './useLogger.js';

/**
 * Composable for AI Fairy voice integration
 */
export function useAIFairyVoice() {
    const logger = useLogger('AIFairyVoice');
    
    // Reactive state
    const isVoiceEnabled = ref(false);
    const isInitialized = ref(false);
    const isSpeaking = ref(false);
    const isListening = ref(false);
    const voiceConfig = ref({
        ttsProvider: 'system',
        autoSpeak: false,
        fairyPersonality: true,
        voiceRate: 0.85,
        voiceVolume: 0.9
    });
    
    // Voice system reference
    let voiceSystem = null;
    
    /**
     * Initialize the AI Fairy voice system
     */
    const initializeVoice = async () => {
        try {
            // Wait for the voice integration script to load
            if (typeof window.AIFairyVoice === 'undefined') {
                logger.warn('AI Fairy Voice system not loaded, loading script...');
                await loadVoiceScript();
            }
            
            voiceSystem = window.AIFairyVoice;
            
            // Initialize the voice system
            const result = await voiceSystem.init();
            if (result) {
                isInitialized.value = true;
                
                // Set up event listeners
                setupVoiceEventListeners();
                
                // Load configuration
                loadVoiceConfig();
                
                logger.info('AI Fairy voice system initialized successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            logger.error('Failed to initialize AI Fairy voice system:', error);
            return false;
        }
    };
    
    /**
     * Load the voice integration script
     */
    const loadVoiceScript = () => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/ai-fairy-voice-integration.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };
    
    /**
     * Setup event listeners for voice system
     */
    const setupVoiceEventListeners = () => {
        if (!voiceSystem) return;
        
        voiceSystem.on('speech-start', () => {
            isSpeaking.value = true;
        });
        
        voiceSystem.on('speech-end', () => {
            isSpeaking.value = false;
        });
        
        voiceSystem.on('speech-error', (data) => {
            isSpeaking.value = false;
            logger.error('Speech error:', data.error);
        });
        
        voiceSystem.on('listen-start', () => {
            isListening.value = true;
        });
        
        voiceSystem.on('listen-stop', () => {
            isListening.value = false;
        });
        
        voiceSystem.on('listen-result', (data) => {
            isListening.value = false;
            handleVoiceInput(data.result);
        });
        
        voiceSystem.on('voice-command', (data) => {
            handleVoiceCommand(data.command);
        });
    };
    
    /**
     * Load voice configuration from localStorage
     */
    const loadVoiceConfig = () => {
        try {
            const saved = localStorage.getItem('ai-fairy-voice-config');
            if (saved) {
                const config = JSON.parse(saved);
                voiceConfig.value = { ...voiceConfig.value, ...config };
            }
            
            // Apply configuration to voice system
            if (voiceSystem) {
                voiceSystem.config = { ...voiceSystem.config, ...voiceConfig.value };
            }
        } catch (error) {
            logger.warn('Failed to load voice config:', error);
        }
    };
    
    /**
     * Save voice configuration to localStorage
     */
    const saveVoiceConfig = () => {
        try {
            localStorage.setItem('ai-fairy-voice-config', JSON.stringify(voiceConfig.value));
            
            // Update voice system configuration
            if (voiceSystem) {
                voiceSystem.config = { ...voiceSystem.config, ...voiceConfig.value };
            }
        } catch (error) {
            logger.error('Failed to save voice config:', error);
        }
    };
    
    /**
     * Speak text using the AI Fairy voice
     */
    const speakAsFairy = async (text) => {
        if (!isInitialized.value || !voiceSystem || !isVoiceEnabled.value) {
            return false;
        }
        
        try {
            // Add fairy personality if enabled
            let fairyText = text;
            if (voiceConfig.value.fairyPersonality) {
                fairyText = addFairyMagic(text);
            }
            
            await voiceSystem.speak(fairyText, {
                rate: voiceConfig.value.voiceRate,
                volume: voiceConfig.value.voiceVolume
            });
            
            return true;
        } catch (error) {
            logger.error('Failed to speak as fairy:', error);
            return false;
        }
    };
    
    /**
     * Add fairy personality to text
     */
    const addFairyMagic = (text) => {
        const sparkles = ['✨', '🌟', '💫', '⭐'];
        const fairyPhrases = [
            'With a sprinkle of magic',
            'By fairy light',
            'With enchanted wisdom',
            'Through fairy dust'
        ];
        
        // Randomly add sparkles
        if (Math.random() < 0.4) {
            const sparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
            text = `${sparkle} ${text}`;
        }
        
        // Occasionally add fairy phrases
        if (Math.random() < 0.2) {
            const phrase = fairyPhrases[Math.floor(Math.random() * fairyPhrases.length)];
            text = `${phrase}, ${text}`;
        }
        
        return text;
    };
    
    /**
     * Listen for voice input
     */
    const listenForVoice = async () => {
        if (!isInitialized.value || !voiceSystem) {
            return null;
        }
        
        try {
            const result = await voiceSystem.listen();
            return result.transcript;
        } catch (error) {
            logger.error('Failed to listen for voice:', error);
            return null;
        }
    };
    
    /**
     * Stop current speech
     */
    const stopSpeaking = async () => {
        if (voiceSystem) {
            await voiceSystem.stop();
        }
    };
    
    /**
     * Stop listening
     */
    const stopListening = async () => {
        if (voiceSystem) {
            await voiceSystem.stopListening();
        }
    };
    
    /**
     * Handle voice input from user
     */
    const handleVoiceInput = (result) => {
        if (result && result.transcript) {
            logger.info('Voice input received:', result.transcript);
            
            // Emit event for main app to handle
            window.dispatchEvent(new CustomEvent('fairy-voice-input', {
                detail: {
                    transcript: result.transcript,
                    confidence: result.confidence || 1.0
                }
            }));
        }
    };
    
    /**
     * Handle voice commands
     */
    const handleVoiceCommand = (command) => {
        logger.info('Voice command received:', command);
        
        // Emit event for main app to handle
        window.dispatchEvent(new CustomEvent('fairy-voice-command', {
            detail: { command }
        }));
    };
    
    /**
     * Enable/disable voice functionality
     */
    const toggleVoice = async () => {
        if (!isInitialized.value) {
            const initialized = await initializeVoice();
            if (!initialized) {
                return false;
            }
        }
        
        isVoiceEnabled.value = !isVoiceEnabled.value;
        voiceConfig.value.autoSpeak = isVoiceEnabled.value;
        saveVoiceConfig();
        
        if (isVoiceEnabled.value) {
            await speakAsFairy("Voice mode enabled! I'm ready to help with magical assistance.");
        }
        
        return isVoiceEnabled.value;
    };
    
    /**
     * Test the voice system
     */
    const testVoice = async () => {
        if (!isInitialized.value) {
            await initializeVoice();
        }
        
        if (voiceSystem) {
            return await voiceSystem.test();
        }
        
        return { success: false, error: 'Voice system not initialized' };
    };
    
    /**
     * Get voice system status
     */
    const getVoiceStatus = () => {
        if (voiceSystem) {
            return voiceSystem.getStatus();
        }
        
        return {
            isInitialized: isInitialized.value,
            isSpeaking: isSpeaking.value,
            isListening: isListening.value,
            isVoiceEnabled: isVoiceEnabled.value
        };
    };
    
    // Computed properties
    const canSpeak = computed(() => isInitialized.value && !isSpeaking.value);
    const canListen = computed(() => isInitialized.value && !isListening.value);
    const voiceStatus = computed(() => getVoiceStatus());
    
    // Watch for configuration changes
    watch(voiceConfig, saveVoiceConfig, { deep: true });
    
    // Lifecycle hooks
    onMounted(() => {
        // Auto-initialize if voice is enabled
        if (voiceConfig.value.autoSpeak) {
            initializeVoice();
        }
    });
    
    onUnmounted(() => {
        // Clean up voice system
        if (voiceSystem) {
            stopSpeaking();
            stopListening();
        }
    });
    
    return {
        // State
        isVoiceEnabled,
        isInitialized,
        isSpeaking,
        isListening,
        voiceConfig,
        
        // Computed
        canSpeak,
        canListen,
        voiceStatus,
        
        // Methods
        initializeVoice,
        speakAsFairy,
        listenForVoice,
        stopSpeaking,
        stopListening,
        toggleVoice,
        testVoice,
        getVoiceStatus,
        
        // Configuration
        loadVoiceConfig,
        saveVoiceConfig
    };
}

/**
 * AI Fairy Chat Message Handler with Voice Integration
 */
export function useAIFairyChatVoice() {
    const { 
        speakAsFairy, 
        isVoiceEnabled, 
        voiceConfig,
        initializeVoice
    } = useAIFairyVoice();
    
    const logger = useLogger('AIFairyChatVoice');
    
    /**
     * Handle new fairy messages with voice
     */
    const handleFairyMessage = async (message) => {
        if (!message || typeof message !== 'string') {
            return;
        }
        
        // Auto-speak if enabled
        if (isVoiceEnabled.value && voiceConfig.value.autoSpeak) {
            try {
                await speakAsFairy(message);
                logger.info('Fairy message spoken:', message.substring(0, 50) + '...');
            } catch (error) {
                logger.error('Failed to speak fairy message:', error);
            }
        }
    };
    
    /**
     * Handle user messages with voice response
     */
    const handleUserMessage = async (message) => {
        if (!message || typeof message !== 'string') {
            return;
        }
        
        // Check for voice-related keywords
        const lowerMessage = message.toLowerCase();
        const voiceKeywords = ['speak', 'say', 'voice', 'talk', 'listen', 'hear'];
        
        if (voiceKeywords.some(keyword => lowerMessage.includes(keyword))) {
            if (!isVoiceEnabled.value) {
                await initializeVoice();
            }
        }
    };
    
    /**
     * Respond to voice commands
     */
    const handleVoiceCommand = async (command) => {
        const lowerCommand = command.toLowerCase();
        
        if (lowerCommand.includes('fairy help') || lowerCommand.includes('what can you do')) {
            await speakAsFairy("I'm your magical AI assistant! I can help with tasks, answer questions, and provide guidance with a touch of fairy magic!");
        } else if (lowerCommand.includes('be quiet') || lowerCommand.includes('stop talking')) {
            voiceConfig.value.autoSpeak = false;
            await speakAsFairy("I'll be quiet now. Just let me know if you need my voice again!");
        } else if (lowerCommand.includes('speak up') || lowerCommand.includes('talk more')) {
            voiceConfig.value.autoSpeak = true;
            await speakAsFairy("I'm happy to speak more! I'll respond with voice to help you better.");
        }
    };
    
    // Set up global event listeners for voice events
    onMounted(() => {
        window.addEventListener('fairy-voice-input', (event) => {
            const { transcript } = event.detail;
            handleUserMessage(transcript);
        });
        
        window.addEventListener('fairy-voice-command', (event) => {
            const { command } = event.detail;
            handleVoiceCommand(command);
        });
    });
    
    return {
        handleFairyMessage,
        handleUserMessage,
        handleVoiceCommand,
        isVoiceEnabled,
        voiceConfig
    };
}

// Export for global use
if (typeof window !== 'undefined') {
    window.useAIFairyVoice = useAIFairyVoice;
    window.useAIFairyChatVoice = useAIFairyChatVoice;
}

export default useAIFairyVoice;
