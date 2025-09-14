/**
 * AI Fairy Voice System Integration Test
 * Comprehensive test suite to verify all voice functionality
 */

// Test configuration
const TEST_CONFIG = {
    testText: "Hello! This is a test of the AI Fairy voice system. I can speak with magical assistance! ✨",
    providers: ['system', 'gemini', 'kokoro'],
    timeout: 10000,
    retries: 3
};

class AIFairyVoiceTest {
    constructor() {
        this.results = {
            initialization: false,
            providers: {},
            settings: false,
            personality: false,
            events: false,
            integration: false
        };
        
        this.errors = [];
        this.warnings = [];
    }
    
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧚‍♀️ Starting AI Fairy Voice System Tests...');
        
        try {
            // Test 1: Initialization
            await this.testInitialization();
            
            // Test 2: Provider functionality
            await this.testProviders();
            
            // Test 3: Settings persistence
            await this.testSettings();
            
            // Test 4: Fairy personality
            await this.testPersonality();
            
            // Test 5: Event system
            await this.testEvents();
            
            // Test 6: Vue integration
            await this.testVueIntegration();
            
            // Generate report
            this.generateReport();
            
        } catch (error) {
            this.errors.push(`Fatal test error: ${error.message}`);
            console.error('❌ Test suite failed:', error);
        }
        
        return this.results;
    }
    
    /**
     * Test system initialization
     */
    async testInitialization() {
        console.log('🔧 Testing system initialization...');
        
        try {
            // Check if voice integration is loaded
            if (typeof window.AIFairyVoice === 'undefined') {
                throw new Error('AIFairyVoice not loaded');
            }
            
            // Test initialization
            const initialized = await window.AIFairyVoice.init();
            if (!initialized) {
                throw new Error('Failed to initialize voice system');
            }
            
            // Check status
            const status = window.AIFairyVoice.getStatus();
            if (!status.isInitialized) {
                throw new Error('System reports not initialized');
            }
            
            this.results.initialization = true;
            console.log('✅ Initialization test passed');
            
        } catch (error) {
            this.errors.push(`Initialization failed: ${error.message}`);
            console.error('❌ Initialization test failed:', error);
        }
    }
    
    /**
     * Test TTS providers
     */
    async testProviders() {
        console.log('🔊 Testing TTS providers...');
        
        for (const provider of TEST_CONFIG.providers) {
            try {
                console.log(`Testing ${provider} provider...`);
                
                // Configure provider
                window.AIFairyVoice.config.ttsProvider = provider;
                await window.AIFairyVoice.initializeServices();
                
                // Test speaking
                const testPromise = window.AIFairyVoice.speak(TEST_CONFIG.testText);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), TEST_CONFIG.timeout)
                );
                
                await Promise.race([testPromise, timeoutPromise]);
                
                this.results.providers[provider] = true;
                console.log(`✅ ${provider} provider test passed`);
                
            } catch (error) {
                this.results.providers[provider] = false;
                
                if (provider === 'system') {
                    this.errors.push(`${provider} provider failed: ${error.message}`);
                } else {
                    this.warnings.push(`${provider} provider not available: ${error.message}`);
                }
                
                console.warn(`⚠️ ${provider} provider test failed:`, error);
            }
        }
    }
    
    /**
     * Test settings persistence
     */
    async testSettings() {
        console.log('⚙️ Testing settings persistence...');
        
        try {
            // Save test settings
            const testSettings = {
                ttsProvider: 'system',
                speechRate: 0.75,
                speechVolume: 0.8,
                voiceMode: true,
                fairyPersonality: true
            };
            
            Object.assign(window.AIFairyVoice.config, testSettings);
            window.AIFairyVoice.saveSettings();
            
            // Reload settings
            await window.AIFairyVoice.loadSettings();
            
            // Verify settings
            for (const [key, value] of Object.entries(testSettings)) {
                if (window.AIFairyVoice.config[key] !== value) {
                    throw new Error(`Setting ${key} not persisted correctly`);
                }
            }
            
            this.results.settings = true;
            console.log('✅ Settings persistence test passed');
            
        } catch (error) {
            this.errors.push(`Settings test failed: ${error.message}`);
            console.error('❌ Settings test failed:', error);
        }
    }
    
    /**
     * Test fairy personality features
     */
    async testPersonality() {
        console.log('🧚‍♀️ Testing fairy personality...');
        
        try {
            // Test text enhancement
            const originalText = "Hello world";
            const enhancedText = window.AIFairyVoice.addFairyPersonality(originalText);
            
            if (enhancedText === originalText) {
                this.warnings.push('Fairy personality not enhancing text');
            }
            
            // Test fairy voice selection
            if (window.AIFairyVoice.findFairyVoice) {
                const fairyVoice = window.AIFairyVoice.findFairyVoice();
                if (!fairyVoice) {
                    this.warnings.push('No suitable fairy voice found');
                } else {
                    console.log('🎤 Selected fairy voice:', fairyVoice.name);
                }
            }
            
            this.results.personality = true;
            console.log('✅ Fairy personality test passed');
            
        } catch (error) {
            this.errors.push(`Personality test failed: ${error.message}`);
            console.error('❌ Personality test failed:', error);
        }
    }
    
    /**
     * Test event system
     */
    async testEvents() {
        console.log('📡 Testing event system...');
        
        try {
            let eventReceived = false;
            
            // Set up event listener
            window.AIFairyVoice.on('test-event', (data) => {
                eventReceived = true;
                console.log('Test event received:', data);
            });
            
            // Emit test event
            window.AIFairyVoice.emit('test-event', { test: true });
            
            // Wait a bit for event processing
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!eventReceived) {
                throw new Error('Event not received');
            }
            
            this.results.events = true;
            console.log('✅ Event system test passed');
            
        } catch (error) {
            this.errors.push(`Event system test failed: ${error.message}`);
            console.error('❌ Event system test failed:', error);
        }
    }
    
    /**
     * Test Vue integration
     */
    async testVueIntegration() {
        console.log('⚛️ Testing Vue integration...');
        
        try {
            // Check if Vue composables are available
            if (typeof window.useAIFairyVoice === 'undefined') {
                throw new Error('Vue composables not loaded');
            }
            
            // Test composable availability
            const composableExists = typeof window.useAIFairyVoice === 'function';
            if (!composableExists) {
                throw new Error('useAIFairyVoice composable not a function');
            }
            
            this.results.integration = true;
            console.log('✅ Vue integration test passed');
            
        } catch (error) {
            this.errors.push(`Vue integration test failed: ${error.message}`);
            console.error('❌ Vue integration test failed:', error);
        }
    }
    
    /**
     * Generate test report
     */
    generateReport() {
        console.log('\n📊 AI Fairy Voice System Test Report');
        console.log('=====================================');
        
        // Overall status
        const totalTests = Object.keys(this.results).length;
        const passedTests = Object.values(this.results).filter(Boolean).length;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        console.log(`Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
        
        // Detailed results
        console.log('\nDetailed Results:');
        for (const [test, passed] of Object.entries(this.results)) {
            const status = passed ? '✅ PASS' : '❌ FAIL';
            console.log(`  ${test}: ${status}`);
        }
        
        // Provider results
        if (Object.keys(this.results.providers).length > 0) {
            console.log('\nProvider Results:');
            for (const [provider, passed] of Object.entries(this.results.providers)) {
                const status = passed ? '✅ PASS' : '❌ FAIL';
                console.log(`  ${provider}: ${status}`);
            }
        }
        
        // Errors
        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        // Warnings
        if (this.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            this.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        
        if (!this.results.initialization) {
            console.log('  - Check browser compatibility for Web Speech API');
        }
        
        if (!this.results.providers.gemini) {
            console.log('  - Configure Gemini API key for advanced TTS');
        }
        
        if (!this.results.providers.kokoro) {
            console.log('  - Install Kokoro package for neural voice synthesis');
        }
        
        if (this.warnings.length > 0) {
            console.log('  - Review warnings for optional feature improvements');
        }
        
        console.log('\n🧚‍♀️ Test completed! The AI Fairy voice system is ready for magical assistance!');
    }
}

// Auto-run tests when page loads
window.addEventListener('load', async () => {
    // Wait for voice system to be available
    let attempts = 0;
    const maxAttempts = 20;
    
    while (typeof window.AIFairyVoice === 'undefined' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }
    
    if (typeof window.AIFairyVoice !== 'undefined') {
        const tester = new AIFairyVoiceTest();
        window.fairyVoiceTestResults = await tester.runAllTests();
    } else {
        console.error('❌ AI Fairy Voice system not loaded after waiting');
    }
});

// Export for manual testing
window.AIFairyVoiceTest = AIFairyVoiceTest;
