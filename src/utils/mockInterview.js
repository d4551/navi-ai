// Mock Interview Service for Gaming Companies
import { logger } from "@/shared/utils/logger";

// Centralized configuration for interview logic
const INTERVIEW_CONFIG = {
  ratios: {
    behavioral: 0.4,
    technical: 0.4,
    studio: 0.2,
  },
  durations: {
    intro: 120,
    behavioral: 90,
    technical: 180,
    studio: 120,
    closing: 60,
  },
  scores: {
    base: 60,
    good: 75,
    min: 60,
    commMin: 70,
    gamingMin: 70,
  },
  responseMs: {
    quick: 30000,
    slow: 60000,
  },
};
export class MockInterviewService {
  constructor(geminiService = null) {
    this.interviewHistory = [];
    this.currentInterview = null;
    this.geminiService = geminiService;
    this.voiceSupported =
      ("speechSynthesis" in window && "webkitSpeechRecognition" in window) ||
      "SpeechRecognition" in window;

    // Gaming studio database with detailed information
    this.gamingStudios = {
      "riot-games": {
        id: "riot-games",
        name: "Riot Games",
        logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/riotgames.svg",
        logoFallback: "🎮",
        logoColor: "#D32936",
        website: "https://www.riotgames.com",
        description: "Creator of League of Legends and Valorant",
        culture: {
          values: [
            "Player Focus",
            "Respect",
            "Honesty",
            "Growth",
            "Excellence",
          ],
          workStyle: "Collaborative, data-driven, player-first mentality",
          environment: "Fast-paced, innovative, global team culture",
        },
        games: [
          "League of Legends",
          "Valorant",
          "Teamfight Tactics",
          "Legends of Runeterra",
          "Wild Rift",
        ],
        technologies: [
          "C++",
          "Python",
          "Go",
          "React",
          "TypeScript",
          "AWS",
          "Kubernetes",
        ],
        commonRoles: [
          "Software Engineer",
          "Game Designer",
          "Data Scientist",
          "Product Manager",
          "UX Designer",
        ],
        interviewStyle: "behavioral + technical, gaming passion emphasis",
        headquarters: "Los Angeles, CA",
        size: "4000+ employees",
        founded: 2006,
        publiclyTraded: false,
      },
      blizzard: {
        id: "blizzard",
        name: "Blizzard Entertainment",
        logo: "https://logos-world.net/wp-content/uploads/2021/02/Blizzard-Entertainment-Logo.png",
        logoFallback: "❄️",
        logoColor: "#00AEFF",
        website: "https://www.blizzard.com",
        description:
          "Legendary studio behind Warcraft, StarCraft, and Overwatch",
        culture: {
          values: [
            "Gameplay First",
            "Commit to Quality",
            "Play Nice, Play Fair",
            "Embrace Your Inner Geek",
            "Every Voice Matters",
            "Think Globally",
            "Lead Responsibly",
            "Learn & Grow",
          ],
          workStyle:
            "Quality-focused, iterative development, strong creative vision",
          environment:
            "Passionate gaming culture, collaborative teams, creative freedom",
        },
        games: [
          "World of Warcraft",
          "Overwatch 2",
          "Diablo IV",
          "Hearthstone",
          "StarCraft II",
        ],
        technologies: [
          "C++",
          "C#",
          "Python",
          "Java",
          "Unity",
          "Unreal Engine",
          "Battle.net",
        ],
        commonRoles: [
          "Game Programmer",
          "Game Designer",
          "Artist",
          "Producer",
          "QA Engineer",
        ],
        interviewStyle: "portfolio-heavy, design thinking, technical depth",
        headquarters: "Irvine, CA",
        size: "4700+ employees",
        founded: 1991,
        publiclyTraded: true,
      },
      "epic-games": {
        id: "epic-games",
        name: "Epic Games",
        logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/epicgames.svg",
        logoFallback: "🏗️",
        logoColor: "#313131",
        website: "https://www.epicgames.com",
        description: "Creators of Fortnite and Unreal Engine",
        culture: {
          values: [
            "We Are One Epic",
            "Grow Together",
            "Fight the Good Fight",
            "Cross Boundaries",
            "Make Something Unreal",
          ],
          workStyle:
            "Innovation-driven, cross-platform thinking, engine development",
          environment:
            "Cutting-edge technology, creative empowerment, global impact",
        },
        games: [
          "Fortnite",
          "Rocket League",
          "Fall Guys",
          "Gears of War series",
        ],
        technologies: [
          "C++",
          "Unreal Engine",
          "Python",
          "C#",
          "JavaScript",
          "AWS",
          "Kubernetes",
        ],
        commonRoles: [
          "Engine Programmer",
          "Gameplay Programmer",
          "Technical Artist",
          "DevOps Engineer",
          "Product Manager",
        ],
        interviewStyle:
          "technical excellence, engine knowledge, systems thinking",
        headquarters: "Cary, NC",
        size: "3000+ employees",
        founded: 1991,
        publiclyTraded: false,
      },
      valve: {
        id: "valve",
        name: "Valve Corporation",
        logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/valve.svg",
        logoFallback: "🎯",
        logoColor: "#FF6B2B",
        website: "https://www.valvesoftware.com",
        description: "Creators of Steam, Half-Life, and Counter-Strike",
        culture: {
          values: [
            "Flat Organization",
            "Self-Direction",
            "Innovation",
            "Long-term Thinking",
            "Player Value",
          ],
          workStyle: "Autonomous teams, experimental, platform-focused",
          environment: "Flat hierarchy, high autonomy, innovative projects",
        },
        games: [
          "Half-Life series",
          "Portal series",
          "Counter-Strike series",
          "Dota 2",
          "Left 4 Dead series",
        ],
        technologies: [
          "C++",
          "Source Engine",
          "Python",
          "JavaScript",
          "Go",
          "Linux",
          "Steam APIs",
        ],
        commonRoles: [
          "Software Engineer",
          "Game Developer",
          "Hardware Engineer",
          "Economist",
          "Psychologist",
        ],
        interviewStyle:
          "problem-solving focus, autonomy assessment, cultural fit",
        headquarters: "Bellevue, WA",
        size: "360+ employees",
        founded: 1996,
        publiclyTraded: false,
      },
      ubisoft: {
        id: "ubisoft",
        name: "Ubisoft",
        logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/ubisoft.svg",
        logoFallback: "🌀",
        logoColor: "#0099FF",
        website: "https://www.ubisoft.com",
        description: "Global publisher of Assassin's Creed, Far Cry, and more",
        culture: {
          values: ["Dare", "Pioneer", "Care", "One Team", "Bold"],
          workStyle:
            "Global collaboration, creative storytelling, open-world focus",
          environment:
            "Diverse teams, creative freedom, international perspective",
        },
        games: [
          "Assassin's Creed series",
          "Far Cry series",
          "Rainbow Six Siege",
          "Watch Dogs series",
          "Just Dance series",
        ],
        technologies: [
          "C++",
          "C#",
          "Python",
          "AnvilNext Engine",
          "Snowdrop Engine",
          "Unity",
          "JavaScript",
        ],
        commonRoles: [
          "Game Programmer",
          "Game Designer",
          "Narrative Designer",
          "Technical Director",
          "Producer",
        ],
        interviewStyle:
          "creativity emphasis, global mindset, collaborative skills",
        headquarters: "Montreuil, France",
        size: "20000+ employees",
        founded: 1986,
        publiclyTraded: true,
      },
      "electronic-arts": {
        id: "electronic-arts",
        name: "Electronic Arts (EA)",
        logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/ea.svg",
        logoFallback: "🎲",
        logoColor: "#000000",
        website: "https://www.ea.com",
        description:
          "Major publisher of FIFA, Madden, The Sims, and Battlefield",
        culture: {
          values: [
            "We Are EA",
            "Inclusion & Diversity",
            "Integrity",
            "Quality",
            "Creativity",
          ],
          workStyle:
            "Data-driven, sports focus, live service games, global reach",
          environment:
            "Large-scale development, established franchises, analytics-focused",
        },
        games: [
          "FIFA series",
          "Madden NFL series",
          "The Sims series",
          "Battlefield series",
          "Apex Legends",
        ],
        technologies: [
          "C++",
          "C#",
          "Python",
          "Frostbite Engine",
          "React",
          "Node.js",
          "AWS",
          "Machine Learning",
        ],
        commonRoles: [
          "Software Engineer",
          "Data Scientist",
          "Product Manager",
          "Live Ops Producer",
          "UX Researcher",
        ],
        interviewStyle:
          "analytics focus, scalability questions, sports knowledge plus",
        headquarters: "Redwood City, CA",
        size: "13000+ employees",
        founded: 1982,
        publiclyTraded: true,
      },
      "naughty-dog": {
        id: "naughty-dog",
        name: "Naughty Dog",
        logo: "https://upload.wikimedia.org/wikipedia/en/6/67/Naughty_Dog_logo.png",
        logoFallback: "🐕",
        logoColor: "#FF6B35",
        website: "https://www.naughtydog.com",
        description: "Acclaimed studio behind The Last of Us and Uncharted",
        culture: {
          values: [
            "Character-Driven Stories",
            "Technical Excellence",
            "Creative Innovation",
            "Team Collaboration",
            "Attention to Detail",
          ],
          workStyle: "Story-focused, high production value, cinematic experiences",
          environment: "Creative storytelling, cutting-edge technology, artistic excellence",
        },
        games: [
          "The Last of Us series",
          "Uncharted series",
          "Crash Bandicoot series",
          "Jak and Daxter series",
        ],
        technologies: [
          "C++",
          "Python",
          "ICE Team Engine",
          "Proprietary Tools",
          "Motion Capture",
          "Advanced Graphics",
        ],
        commonRoles: [
          "Game Programmer",
          "Technical Artist",
          "Game Designer",
          "Narrative Designer",
          "Animation Programmer",
        ],
        interviewStyle: "portfolio showcase, storytelling passion, technical depth",
        headquarters: "Santa Monica, CA",
        size: "400+ employees",
        founded: 1984,
        publiclyTraded: false,
      },
      nintendo: {
        id: "nintendo",
        name: "Nintendo",
        logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/nintendo.svg",
        logoFallback: "🍄",
        logoColor: "#E60012",
        website: "https://www.nintendo.com",
        description: "Iconic creator of Mario, Zelda, and innovative gaming hardware",
        culture: {
          values: [
            "Entertainment is Our Business",
            "Innovation",
            "Quality",
            "Originality",
            "Fun for Everyone",
          ],
          workStyle: "Hardware-software integration, family-friendly focus, unique gameplay",
          environment: "Traditional Japanese company culture, innovation-driven, long-term vision",
        },
        games: [
          "Super Mario series",
          "The Legend of Zelda series",
          "Pokémon series",
          "Animal Crossing series",
          "Splatoon series",
        ],
        technologies: [
          "C++",
          "Custom Hardware",
          "Nintendo SDK",
          "Proprietary Engines",
          "ARM Architecture",
        ],
        commonRoles: [
          "Hardware Engineer",
          "Game Programmer",
          "Game Designer",
          "System Developer",
          "Graphics Programmer",
        ],
        interviewStyle: "innovation focus, gameplay creativity, hardware understanding",
        headquarters: "Kyoto, Japan",
        size: "6500+ employees",
        founded: 1889,
        publiclyTraded: true,
      },
    };

    // Interview question banks by category
    this.questionBanks = {
      behavioral: {
        general: [
          "Tell me about yourself and your passion for gaming.",
          "Describe a time when you had to work with a difficult team member.",
          "How do you handle criticism of your work?",
          "Tell me about a project you're particularly proud of.",
          "How do you stay current with gaming trends and technology?",
          "Describe a time when you had to learn something completely new quickly.",
          "How do you prioritize tasks when you have multiple deadlines?",
          "Tell me about a time when you failed and what you learned from it.",
        ],
        gaming_specific: [
          "What's your favorite game and why? How would you improve it?",
          "How has your gaming experience influenced your professional approach?",
          "Describe a gaming community you've been part of and your role in it.",
          "Tell me about a time when gaming skills helped you solve a real-world problem.",
          "How do you think your gaming background gives you an edge in this role?",
          "What gaming trends do you think will shape the industry in the next 5 years?",
          "Describe a time when you led a team or raid in a game. How did you handle leadership?",
          "How do you balance gaming as a hobby versus gaming as a career interest?",
        ],
      },
      technical: {
        programming: [
          "Explain the difference between a stack and a queue, with gaming examples.",
          "How would you optimize a game loop for 60 FPS performance?",
          "Describe how you would implement a simple collision detection system.",
          "What's the difference between TCP and UDP, and when would you use each in gaming?",
          "How would you handle memory management in a resource-intensive game?",
          "Explain the concept of game states and how you'd implement a state machine.",
          "How would you implement a basic networking system for a multiplayer game?",
          "Describe how you'd approach debugging a performance issue in a game.",
        ],
        design: [
          "How would you design a progression system that keeps players engaged?",
          "What makes a good tutorial system? Design one for a complex strategy game.",
          "How would you balance a competitive multiplayer game?",
          "Describe how you'd design a matchmaking system.",
          "What's your approach to creating accessible game design?",
          "How would you design a monetization system that's fair to players?",
          "Describe how you'd handle player feedback and iterate on game design.",
          "How would you design systems to prevent griefing in online games?",
        ],
        data: [
          "How would you set up analytics to track player engagement?",
          "What metrics would you use to measure game success?",
          "How would you A/B test a new game feature?",
          "Describe how you'd analyze player behavior to improve retention.",
          "How would you set up monitoring for a live-service game?",
          "What would you do if you noticed a sudden drop in player activity?",
          "How would you measure the success of a balance change?",
          "Describe how you'd build a recommendation system for in-game content.",
        ],
      },
      studio_specific: {
        // Questions tailored to each studio's culture and games
      },
    };
  }

  // Get all available studios
  getStudios() {
    return Object.values(this.gamingStudios);
  }

  // Get specific studio information
  getStudio(studioId) {
    return this.gamingStudios[studioId];
  }

  // Start a new mock interview with user context
  async startInterview(
    studioId,
    roleType,
    interviewType = "chat",
    difficulty = "medium",
    userContext = {},
  ) {
    const studio = this.getStudio(studioId);
    if (!studio) {
      throw new Error("Studio not found");
    }

    this.currentInterview = {
      id: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studioId,
      studio,
      roleType,
      interviewType, // 'chat' or 'voice'
      difficulty,
      userContext: {
        name: userContext.name || "Candidate",
        gamingExperience: userContext.gamingExperience || [],
        primaryGames: userContext.primaryGames || [],
        skillsHighlights: userContext.skillsHighlights || [],
        careerGoals: userContext.careerGoals || "",
        strengths: userContext.strengths || [],
        experience: userContext.experience || [],
        gamingProfile: userContext.gamingProfile || {},
      },
      startTime: new Date(),
      questions: [],
      responses: [],
      currentQuestionIndex: 0,
      status: "in_progress",
      feedback: null,
      score: null,
    };

    // Generate interview questions based on studio and role
    this.currentInterview.questions = this.generateQuestions(
      studio,
      roleType,
      difficulty,
    );

    // Add to history
    this.interviewHistory.unshift(this.currentInterview);

    return this.currentInterview;
  }

  // Generate questions for the interview
  generateQuestions(studio, roleType, difficulty) {
    const questions = [];
    const questionCount =
      difficulty === "easy" ? 6 : difficulty === "hard" ? 12 : 9;

    // Always start with introduction
    questions.push({
      id: "intro",
      type: "introduction",
      category: "introduction",
      question: `Hello! I'm conducting a mock interview for a ${roleType} position at ${studio.name}. I'm excited to learn about your background and how your gaming experience translates to professional skills. Let's start with: Tell me about yourself and what draws you to ${studio.name}.`,
      expectedDuration: INTERVIEW_CONFIG.durations.intro,
      keyPoints: [
        "Background",
        "Gaming passion",
        "Studio knowledge",
        "Role interest",
      ],
      tips: "Keep it concise (1-2 minutes), highlight gaming experience, show studio knowledge",
    });

    // Add behavioral questions (40% of interview)
    const behavioralCount = Math.ceil(
      questionCount * INTERVIEW_CONFIG.ratios.behavioral,
    );
    const behavioralQuestions = [
      ...this.questionBanks.behavioral.general,
      ...this.questionBanks.behavioral.gaming_specific,
    ];

    for (let i = 0; i < behavioralCount; i++) {
      const question =
        behavioralQuestions[
          Math.floor(Math.random() * behavioralQuestions.length)
        ];
      questions.push({
        id: `behavioral_${i}`,
        type: "behavioral",
        category: "behavioral",
        question,
        expectedDuration: INTERVIEW_CONFIG.durations.behavioral,
        keyPoints: [
          "Specific example",
          "Action taken",
          "Result achieved",
          "Learning/Growth",
        ],
        tips: "Use STAR method (Situation, Task, Action, Result)",
      });
    }

    // Add technical questions based on role (40% of interview)
    const technicalCount = Math.ceil(
      questionCount * INTERVIEW_CONFIG.ratios.technical,
    );
    let technicalQuestions = [];

    if (
      roleType.toLowerCase().includes("engineer") ||
      roleType.toLowerCase().includes("developer") ||
      roleType.toLowerCase().includes("programmer")
    ) {
      technicalQuestions = this.questionBanks.technical.programming;
    } else if (roleType.toLowerCase().includes("designer")) {
      technicalQuestions = this.questionBanks.technical.design;
    } else if (
      roleType.toLowerCase().includes("data") ||
      roleType.toLowerCase().includes("analyst")
    ) {
      technicalQuestions = this.questionBanks.technical.data;
    } else {
      technicalQuestions = [
        ...this.questionBanks.technical.programming,
        ...this.questionBanks.technical.design,
      ];
    }

    for (let i = 0; i < technicalCount; i++) {
      const question =
        technicalQuestions[
          Math.floor(Math.random() * technicalQuestions.length)
        ];
      questions.push({
        id: `technical_${i}`,
        type: "technical",
        category: "technical",
        question,
        expectedDuration: INTERVIEW_CONFIG.durations.technical,
        keyPoints: [
          "Technical accuracy",
          "Problem-solving approach",
          "Gaming context",
          "Best practices",
        ],
        tips: "Think out loud, relate to gaming examples, discuss trade-offs",
      });
    }

    // Add studio-specific questions (20% of interview)
    const studioCount =
      Math.floor(questionCount * INTERVIEW_CONFIG.ratios.studio) || 1;
    const studioQuestions = this.generateStudioSpecificQuestions(studio);

    for (let i = 0; i < studioCount; i++) {
      const question =
        studioQuestions[Math.floor(Math.random() * studioQuestions.length)];
      questions.push({
        id: `studio_${i}`,
        type: "studio_specific",
        category: "studio_culture",
        question,
        expectedDuration: INTERVIEW_CONFIG.durations.studio,
        keyPoints: [
          "Studio knowledge",
          "Cultural fit",
          "Game familiarity",
          "Passion demonstration",
        ],
        tips: `Research ${studio.name}'s values, games, and culture beforehand`,
      });
    }

    // End with closing question
    questions.push({
      id: "closing",
      type: "closing",
      category: "closing",
      question: `That's all my questions! Do you have any questions about ${studio.name}, the ${roleType} role, or our team culture?`,
      expectedDuration: INTERVIEW_CONFIG.durations.closing,
      keyPoints: ["Thoughtful questions", "Role interest", "Company research"],
      tips: "Prepare 2-3 thoughtful questions about the role, team, or company",
    });

    return questions;
  }

  // Generate studio-specific questions
  generateStudioSpecificQuestions(studio) {
    const questions = [];

    // Games-specific questions
    if (studio.games && studio.games.length > 0) {
      questions.push(
        `What's your experience with ${studio.games[0]}? How would you improve the player experience?`,
        `How do you think ${studio.name}'s games compare to competitors in the market?`,
        `Which of our games resonates most with you and why?`,
      );
    }

    // Culture-specific questions
    if (studio.culture && studio.culture.values) {
      questions.push(
        `How do you see yourself embodying our value of "${studio.culture.values[0]}"?`,
        `Describe a time when you demonstrated "${studio.culture.values[1] || studio.culture.values[0]}" in your work.`,
      );
    }

    // Technology-specific questions
    if (studio.technologies && studio.technologies.length > 0) {
      questions.push(
        `What's your experience with ${studio.technologies[0]}? How would you apply it in game development?`,
        `How do you approach learning new technologies like those we use at ${studio.name}?`,
      );
    }

    // General studio questions
    questions.push(
      `Why do you want to work at ${studio.name} specifically?`,
      `What do you know about our company culture and work environment?`,
      `How do you think your gaming background aligns with our mission?`,
      `What excites you most about the opportunity to work here?`,
    );

    return questions;
  }

  // Get current question
  getCurrentQuestion() {
    if (
      !this.currentInterview ||
      this.currentInterview.status !== "in_progress"
    ) {
      logger.warn("No active interview or interview not in progress");
      return {
        success: false,
        error: {
          code: "NO_ACTIVE_INTERVIEW",
          message: "No active interview or interview not in progress",
        },
      };
    }

    const { questions, currentQuestionIndex } = this.currentInterview;
    if (!questions[currentQuestionIndex]) {
      logger.warn("Question not found at index", {
        index: currentQuestionIndex,
      });
      return {
        success: false,
        error: {
          code: "QUESTION_NOT_FOUND",
          message: "Question not found at current index",
        },
      };
    }
    return { success: true, question: questions[currentQuestionIndex] };
  }

  // Submit response to current question
  async submitResponse(responseInput, audioBlob = null, options = {}) {
    if (
      !this.currentInterview ||
      this.currentInterview.status !== "in_progress"
    ) {
      throw new Error("No active interview");
    }

    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion || currentQuestion.success === false) {
      throw new Error("No current question");
    }

    // Accept legacy string or new object shape
    let rawText = "";
    let meta = {};
    if (typeof responseInput === "string") {
      rawText = responseInput;
    } else if (responseInput && typeof responseInput === "object") {
      rawText = responseInput.response || "";
      meta = { ...responseInput };
    }

    const trimmed = (rawText || "").trim();
    const skipped = options.skipped || meta.skipped || trimmed.length === 0;

    // Record the response (allow empty for skipped questions)
    const responseData = {
      questionId: currentQuestion.question.id,
      question: currentQuestion.question.question,
      response: trimmed,
      skipped,
      timestamp: new Date(),
      audioBlob: audioBlob,
      responseTime:
        Date.now() - (this.currentInterview.questionStartTime || Date.now()),
      wordCount: skipped ? 0 : trimmed.split(/\s+/).filter(Boolean).length,
      ...meta,
    };

    this.currentInterview.responses.push(responseData);

    // Move to next question
    this.currentInterview.currentQuestionIndex++;

    // Check if interview is complete
    if (
      this.currentInterview.currentQuestionIndex >=
      this.currentInterview.questions.length
    ) {
      return this.completeInterview();
    }

    // Set start time for next question
    this.currentInterview.questionStartTime = Date.now();

    return {
      status: "continue",
      nextQuestion: this.getCurrentQuestion().question,
      progress: {
        current: this.currentInterview.currentQuestionIndex + 1,
        total: this.currentInterview.questions.length,
        percentage: Math.round(
          ((this.currentInterview.currentQuestionIndex + 1) /
            this.currentInterview.questions.length) *
            100,
        ),
      },
    };
  }

  // Complete the interview and generate feedback
  async completeInterview() {
    if (!this.currentInterview) {
      throw new Error("No active interview");
    }

    this.currentInterview.status = "completed";
    this.currentInterview.endTime = new Date();
    this.currentInterview.duration =
      this.currentInterview.endTime - this.currentInterview.startTime;

    // Generate AI feedback and scoring
    const feedback = await this.generateFeedback(this.currentInterview);
    this.currentInterview.feedback = feedback;
    this.currentInterview.score = feedback.overallScore;

    return {
      status: "completed",
      interview: this.currentInterview,
      feedback: feedback,
    };
  }

  // Generate comprehensive feedback using AI analysis
  async generateFeedback(interview) {
    const responses = interview.responses;
    const studio = interview.studio;

    // Calculate basic metrics
    const totalWords = responses.reduce((sum, r) => sum + r.wordCount, 0);
    const averageResponseTime =
      responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    const averageWordsPerResponse = totalWords / responses.length;

    // Use AI feedback if geminiService is available
    if (this.geminiService) {
      try {
        const aiAnalysis = await this.generateAIFeedback(interview);
        return aiAnalysis;
      } catch (error) {
        logger.warn("AI feedback failed, using fallback analysis:", error);
        // Fall through to basic analysis
      }
    }

    // Fallback: Analyze response quality (basic scoring)
    const scores = {
      communication: this.analyzeCommucation(responses),
      technical: this.analyzeTechnicalDepth(responses, interview.roleType),
      cultural_fit: this.analyzeCulturalFit(responses, studio),
      gaming_knowledge: this.analyzeGamingKnowledge(responses, studio),
      problem_solving: this.analyzeProblemSolving(responses),
    };

    const overallScore =
      Object.values(scores).reduce((sum, score) => sum + score, 0) /
      Object.keys(scores).length;

    return {
      overallScore: Math.round(overallScore),
      categoryScores: scores,
      metrics: {
        totalWords,
        averageResponseTime: Math.round(averageResponseTime / 1000), // in seconds
        averageWordsPerResponse: Math.round(averageWordsPerResponse),
        interviewDuration: Math.round(interview.duration / (1000 * 60)), // in minutes
      },
      strengths: this.identifyStrengths(scores, responses),
      improvements: this.identifyImprovements(scores, responses),
      recommendations: this.generateRecommendations(
        scores,
        studio,
        interview.roleType,
      ),
      detailedFeedback: this.generateDetailedFeedback(responses, studio),
    };
  }

  // Generate AI-powered feedback and analysis
  async generateAIFeedback(interview) {
    const { responses, studio, roleType, difficulty, userContext } = interview;

    const _interviewContext = {
      company: studio.name,
      role: roleType,
      difficulty: difficulty,
      companyValues: studio.culture.values,
      candidateProfile: {
        name: userContext.name,
        primaryGames: userContext.primaryGames,
        gamingExperience: userContext.gamingExperience,
        careerGoals: userContext.careerGoals,
        strengths: userContext.strengths,
        skillsHighlights: userContext.skillsHighlights,
      },
      responses: responses.map((r) => ({
        question: r.question,
        answer: r.response,
        wordCount: r.wordCount,
        responseTime: Math.round(r.responseTime / 1000),
      })),
    };

    // Get AI analysis of interview performance with user context
    const feedbackPrompt = `Analyze this mock interview performance for ${userContext.name} applying for a ${roleType} role at ${studio.name}.

Candidate Profile:
- Name: ${userContext.name}
- Career Goals: ${userContext.careerGoals}
- Primary Games: ${userContext.primaryGames.join(", ") || "Not specified"}
- Gaming Experience: ${userContext.gamingExperience.join(", ") || "Not specified"}
- Key Strengths: ${userContext.strengths.join(", ") || "Not specified"}
- Skills Highlights: ${userContext.skillsHighlights.join(", ") || "Not specified"}

Company Context (${studio.name}):
- Values: ${studio.culture.values.join(", ")}
- Games: ${studio.games.join(", ")}
- Culture: ${studio.culture.workStyle}
- Technologies: ${studio.technologies.join(", ")}

Interview Responses:
${responses.map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.response}\n(${r.wordCount} words, ${Math.round(r.responseTime / 1000)}s response time)\n`).join("\n")}

Provide a detailed, personalized analysis based on the candidate's gaming background and career goals:

1. Overall score (0-100) considering their gaming experience relevance
2. Category scores for: communication, technical, cultural_fit, gaming_knowledge, problem_solving
3. Top 3 strengths (specifically noting how their gaming background helps)
4. Top 3 areas for improvement (actionable advice for their career transition)
5. Specific recommendations tailored to their gaming experience and this company/role

Format as JSON with these exact keys: overallScore, categoryScores, strengths, improvements, recommendations`;

    try {
      const analysis = await this.geminiService.generateSmartContent(
        "interview_feedback",
        feedbackPrompt,
        {
          type: "interview_analysis",
          company: studio.name,
          role: roleType,
        },
      );

      // Parse AI response and structure feedback
      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(analysis);
      } catch (_parseError) {
        // Fallback parsing if AI doesn't return proper JSON
        parsedAnalysis = this.parseAIFeedbackText(analysis);
      }

      // Calculate metrics
      const totalWords = responses.reduce((sum, r) => sum + r.wordCount, 0);
      const averageResponseTime =
        responses.reduce((sum, r) => sum + r.responseTime, 0) /
        responses.length;
      const averageWordsPerResponse = totalWords / responses.length;

      return {
        overallScore:
          parsedAnalysis.overallScore || INTERVIEW_CONFIG.scores.good,
        categoryScores: parsedAnalysis.categoryScores || {
          communication: INTERVIEW_CONFIG.scores.good,
          technical: INTERVIEW_CONFIG.scores.commMin,
          cultural_fit: 80,
          gaming_knowledge: 85,
          problem_solving: INTERVIEW_CONFIG.scores.commMin,
        },
        metrics: {
          totalWords,
          averageResponseTime: Math.round(averageResponseTime / 1000),
          averageWordsPerResponse: Math.round(averageWordsPerResponse),
          interviewDuration: Math.round(interview.duration / (1000 * 60)),
        },
        strengths: parsedAnalysis.strengths || [
          "Clear communication style",
          "Good gaming industry knowledge",
          "Strong problem-solving approach",
        ],
        improvements: parsedAnalysis.improvements || [
          "Provide more specific examples",
          "Demonstrate deeper technical knowledge",
          "Show stronger company research",
        ],
        recommendations: parsedAnalysis.recommendations || [
          "Practice STAR method for behavioral questions",
          "Research company games and recent updates",
          "Prepare specific technical examples",
        ],
        aiGenerated: true,
      };
    } catch (error) {
      console.error("AI feedback generation failed:", error);
      throw error;
    }
  }

  // Fallback parser for AI feedback when JSON parsing fails
  parseAIFeedbackText(text) {
    const result = {
      overallScore: INTERVIEW_CONFIG.scores.good,
      categoryScores: {},
      strengths: [],
      improvements: [],
      recommendations: [],
    };

    // Extract overall score
    const scoreMatch = text.match(/overall score:?\s*(\d+)/i);
    if (scoreMatch) {
      result.overallScore = parseInt(scoreMatch[1]);
    }

    // Extract strengths
    const strengthsMatch = text.match(
      /strengths?:?\s*\n?(.*?)(?=\n.*?improvements?|$)/is,
    );
    if (strengthsMatch) {
      result.strengths = strengthsMatch[1]
        .split(/\n|•|-/)
        .filter((s) => s.trim())
        .slice(0, 3)
        .map((s) => s.trim());
    }

    // Extract improvements
    const improvementsMatch = text.match(
      /improvements?|areas for improvement:?\s*\n?(.*?)(?=\n.*?recommendations?|$)/is,
    );
    if (improvementsMatch) {
      result.improvements = improvementsMatch[1]
        .split(/\n|•|-/)
        .filter((s) => s.trim())
        .slice(0, 3)
        .map((s) => s.trim());
    }

    // Extract recommendations
    const recommendationsMatch = text.match(/recommendations?:?\s*\n?(.*?)$/is);
    if (recommendationsMatch) {
      result.recommendations = recommendationsMatch[1]
        .split(/\n|•|-/)
        .filter((s) => s.trim())
        .slice(0, 3)
        .map((s) => s.trim());
    }

    return result;
  }

  // Analysis methods for feedback generation
  analyzeCommucation(responses) {
    let score = INTERVIEW_CONFIG.scores.base; // Base score

    responses.forEach((response) => {
      // Word count analysis
      if (response.wordCount > 150 && response.wordCount < 300) {
        score += 5;
      } else if (response.wordCount < 50) {
        score -= 10;
      } else if (response.wordCount > 500) {
        score -= 5;
      }

      // Basic structure analysis (simplified)
      if (
        response.response.includes("example") ||
        response.response.includes("experience")
      ) {
        score += 3;
      }
      if (
        response.response.includes("team") ||
        response.response.includes("collaborate")
      ) {
        score += 2;
      }
      if (
        response.response.match(/\b(I|my|me)\b/gi)?.length >
        response.response.split(" ").length * 0.3
      ) {
        score -= 5;
      }
    });

    return Math.min(100, Math.max(0, score));
  }

  analyzeTechnicalDepth(responses, _roleType) {
    let score = 50; // Base score

    const technicalTerms = [
      "algorithm",
      "database",
      "API",
      "framework",
      "architecture",
      "optimization",
      "performance",
      "scalability",
      "debugging",
      "testing",
    ];
    const gamingTechnicalTerms = [
      "engine",
      "fps",
      "latency",
      "networking",
      "collision",
      "rendering",
      "shader",
      "gameplay",
      "mechanics",
      "balance",
    ];

    responses.forEach((response) => {
      const text = response.response.toLowerCase();

      // Count technical terms
      const techCount = technicalTerms.filter((term) =>
        text.includes(term),
      ).length;
      const gamingTechCount = gamingTechnicalTerms.filter((term) =>
        text.includes(term),
      ).length;

      score += techCount * 3;
      score += gamingTechCount * 4;

      // Bonus for specific examples
      if (text.includes("for example") || text.includes("specifically")) {
        score += 5;
      }
    });

    return Math.min(100, Math.max(0, score));
  }

  analyzeCulturalFit(responses, studio) {
    let score = 50; // Base score

    responses.forEach((response) => {
      const text = response.response.toLowerCase();

      // Check for studio values mentions
      if (studio.culture?.values) {
        studio.culture.values.forEach((value) => {
          if (text.includes(value.toLowerCase())) {
            score += 8;
          }
        });
      }

      // Check for collaboration indicators
      if (
        text.includes("team") ||
        text.includes("collaborate") ||
        text.includes("together")
      ) {
        score += 3;
      }

      // Check for growth mindset
      if (
        text.includes("learn") ||
        text.includes("improve") ||
        text.includes("feedback")
      ) {
        score += 3;
      }

      // Check for passion indicators
      if (
        text.includes("passionate") ||
        text.includes("excited") ||
        text.includes("love")
      ) {
        score += 2;
      }
    });

    return Math.min(100, Math.max(0, score));
  }

  analyzeGamingKnowledge(responses, studio) {
    let score = 50; // Base score

    responses.forEach((response) => {
      const text = response.response.toLowerCase();

      // Check for studio games mentions
      if (studio.games) {
        studio.games.forEach((game) => {
          if (text.includes(game.toLowerCase())) {
            score += 10;
          }
        });
      }

      // Check for gaming terms
      const gamingTerms = [
        "player",
        "game",
        "gaming",
        "gameplay",
        "mechanics",
        "balance",
        "meta",
        "community",
        "competitive",
        "casual",
      ];
      const mentionedTerms = gamingTerms.filter((term) =>
        text.includes(term),
      ).length;
      score += mentionedTerms * 2;

      // Check for industry knowledge
      if (
        text.includes("industry") ||
        text.includes("trend") ||
        text.includes("market")
      ) {
        score += 5;
      }
    });

    return Math.min(100, Math.max(0, score));
  }

  analyzeProblemSolving(responses) {
    let score = 50; // Base score

    responses.forEach((response) => {
      const text = response.response.toLowerCase();

      // Check for problem-solving indicators
      if (
        text.includes("problem") ||
        text.includes("challenge") ||
        text.includes("solution")
      ) {
        score += 5;
      }
      if (
        text.includes("approach") ||
        text.includes("method") ||
        text.includes("strategy")
      ) {
        score += 4;
      }
      if (
        text.includes("analyze") ||
        text.includes("identify") ||
        text.includes("debug")
      ) {
        score += 3;
      }

      // Check for structured thinking
      if (
        text.includes("first") ||
        text.includes("then") ||
        text.includes("finally")
      ) {
        score += 3;
      }
      if (
        text.match(/\b(because|since|therefore|however|although)\b/g)?.length >
        0
      ) {
        score += 2;
      }
    });

    return Math.min(100, Math.max(0, score));
  }

  // Helper methods for feedback generation
  identifyStrengths(scores, _responses) {
    const strengths = [];
    const topScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    topScores.forEach(([category, score]) => {
      if (score >= INTERVIEW_CONFIG.scores.good) {
        switch (category) {
          case "communication":
            strengths.push(
              "Excellent communication skills with clear, structured responses",
            );
            break;
          case "technical":
            strengths.push(
              "Strong technical knowledge and ability to explain complex concepts",
            );
            break;
          case "cultural_fit":
            strengths.push(
              "Great cultural alignment and understanding of company values",
            );
            break;
          case "gaming_knowledge":
            strengths.push("Deep gaming industry knowledge and passion");
            break;
          case "problem_solving":
            strengths.push("Strong analytical and problem-solving approach");
            break;
        }
      }
    });

    return strengths.length > 0
      ? strengths
      : ["Consistent performance across all areas"];
  }

  identifyImprovements(scores, _responses) {
    const improvements = [];
    const lowScores = Object.entries(scores).filter(
      ([, score]) => score < INTERVIEW_CONFIG.scores.min,
    );

    lowScores.forEach(([category]) => {
      switch (category) {
        case "communication":
          improvements.push(
            "Work on providing more specific examples and structured responses",
          );
          break;
        case "technical":
          improvements.push(
            "Demonstrate deeper technical knowledge with concrete examples",
          );
          break;
        case "cultural_fit":
          improvements.push(
            "Research company values more thoroughly and show alignment",
          );
          break;
        case "gaming_knowledge":
          improvements.push(
            "Stay more current with gaming trends and industry developments",
          );
          break;
        case "problem_solving":
          improvements.push(
            "Use more structured problem-solving approaches (e.g., STAR method)",
          );
          break;
      }
    });

    return improvements.length > 0
      ? improvements
      : ["Continue practicing interview skills for consistency"];
  }

  generateRecommendations(scores, studio, roleType) {
    const recommendations = [];

    // Role-specific recommendations
    if (roleType.toLowerCase().includes("engineer")) {
      recommendations.push(
        "Practice coding problems on LeetCode or HackerRank",
      );
      recommendations.push(
        "Build a portfolio project using technologies mentioned in the job description",
      );
    } else if (roleType.toLowerCase().includes("designer")) {
      recommendations.push("Create design case studies showing your process");
      recommendations.push("Study the UX patterns in popular games");
    }

    // Studio-specific recommendations
    recommendations.push(
      `Play and analyze ${studio.games?.[0] || "the company's games"} to understand their design philosophy`,
    );
    recommendations.push(
      `Research ${studio.name}'s recent news and developments`,
    );

    // General recommendations based on scores
    if (scores.communication < INTERVIEW_CONFIG.scores.commMin) {
      recommendations.push("Practice the STAR method for behavioral questions");
    }

    if (scores.gaming_knowledge < INTERVIEW_CONFIG.scores.gamingMin) {
      recommendations.push("Stay updated with gaming industry news and trends");
    }

    return recommendations;
  }

  generateDetailedFeedback(responses, _studio) {
    const feedback = [];

    responses.forEach((response, index) => {
      const analysis = {
        questionNumber: index + 1,
        category: response.question.includes("yourself")
          ? "introduction"
          : "general",
        strengths: [],
        improvements: [],
        score: Math.floor(Math.random() * 30) + 70, // Simplified scoring
      };

      // Analyze response characteristics
      if (response.wordCount > 100) {
        analysis.strengths.push("Good response length with sufficient detail");
      } else {
        analysis.improvements.push("Consider providing more detailed examples");
      }

      if (response.responseTime < INTERVIEW_CONFIG.responseMs.quick / 3) {
        analysis.strengths.push("Quick thinking and immediate response");
      } else if (response.responseTime > INTERVIEW_CONFIG.responseMs.quick) {
        analysis.improvements.push(
          "Work on reducing thinking time for fluency",
        );
      }

      feedback.push(analysis);
    });

    return feedback;
  }

  // Voice functionality
  isVoiceSupported() {
    return this.voiceSupported;
  }

  // Get interview history
  getInterviewHistory() {
    return this.interviewHistory;
  }

  // Get interview statistics
  getInterviewStats() {
    const completed = this.interviewHistory.filter(
      (i) => i.status === "completed",
    );

    if (completed.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        favoriteStudio: null,
        improvementTrend: 0,
      };
    }

    const averageScore =
      completed.reduce((sum, i) => sum + (i.score || 0), 0) / completed.length;
    const studioCount = {};
    completed.forEach((i) => {
      studioCount[i.studioId] = (studioCount[i.studioId] || 0) + 1;
    });

    const favoriteStudioId = Object.entries(studioCount).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];
    const favoriteStudio = favoriteStudioId
      ? this.getStudio(favoriteStudioId)
      : null;

    // Calculate improvement trend (last 3 vs previous 3)
    let improvementTrend = 0;
    if (completed.length >= 6) {
      const recent =
        completed.slice(0, 3).reduce((sum, i) => sum + i.score, 0) / 3;
      const older =
        completed.slice(3, 6).reduce((sum, i) => sum + i.score, 0) / 3;
      improvementTrend = recent - older;
    }

    // Calculate average response time
    const totalResponseTime = completed.reduce((sum, interview) => {
      if (interview.responses) {
        const interviewResponseTime = interview.responses.reduce(
          (respSum, response) => {
            return respSum + (response.responseTime || 0);
          },
          0,
        );
        return sum + interviewResponseTime;
      }
      return sum;
    }, 0);
    const totalResponses = completed.reduce((sum, interview) => {
      return sum + (interview.responses ? interview.responses.length : 0);
    }, 0);
    const averageResponseTime =
      totalResponses > 0 ? totalResponseTime / totalResponses : 0;

    // Category breakdown
    const categoryScores = {};
    completed.forEach((interview) => {
      if (interview.responses) {
        interview.responses.forEach((response) => {
          const category = response.category || "General";
          if (!categoryScores[category]) {
            categoryScores[category] = { total: 0, count: 0 };
          }
          categoryScores[category].total += response.score || 0;
          categoryScores[category].count += 1;
        });
      }
    });

    const categoryBreakdown = Object.entries(categoryScores).map(
      ([name, data]) => ({
        name,
        score: Math.round(data.total / data.count),
      }),
    );

    // Studio performance
    const studioPerformance = Object.entries(studioCount)
      .map(([studioId, attempts]) => {
        const studioInterviews = completed.filter(
          (i) => i.studioId === studioId,
        );
        const avgScore =
          studioInterviews.reduce((sum, i) => sum + (i.score || 0), 0) /
          attempts;
        return {
          name: this.getStudio(studioId)?.name || "Unknown Studio",
          attempts,
          avgScore: Math.round(avgScore),
        };
      })
      .sort((a, b) => b.attempts - a.attempts);

    // AI-generated insights
    const strengths = [];
    const areasToImprove = [];

    // Generate insights based on performance data
    if (averageScore >= 8) {
      strengths.push("Consistently high-quality responses");
    }
    if (averageResponseTime < INTERVIEW_CONFIG.responseMs.quick) {
      // Quick response
      strengths.push("Quick thinking and response times");
    }
    if (improvementTrend > 0) {
      strengths.push("Showing steady improvement over time");
    }

    if (averageScore < 6) {
      areasToImprove.push("Focus on providing more detailed responses");
    }
    if (averageResponseTime > INTERVIEW_CONFIG.responseMs.slow) {
      // Slow response
      areasToImprove.push("Work on reducing response times");
    }
    if (categoryBreakdown.some((cat) => cat.score < 6)) {
      const weakCategories = categoryBreakdown
        .filter((cat) => cat.score < 6)
        .map((cat) => cat.name);
      areasToImprove.push(
        `Strengthen performance in: ${weakCategories.join(", ")}`,
      );
    }

    return {
      totalInterviews: completed.length,
      averageScore: Math.round(averageScore),
      favoriteStudio,
      improvementTrend: Math.round(improvementTrend),
      averageResponseTime: Math.round(averageResponseTime),
      categoryBreakdown,
      studioPerformance,
      strengths,
      areasToImprove,
    };
  }
}

export default MockInterviewService;
