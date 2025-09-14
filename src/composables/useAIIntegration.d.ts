export function useAIIntegration(
    _resumeData: any,
    _coverLetterData: any,
    _jobDescription: string
): {
    aiReady: boolean;
    aiProcessing: boolean;
    atsScore: number;
    handleAIRequest: (..._args: any[]) => void;
    handleTailoring: (..._args: any[]) => void;
    handleAISuggestions: (..._args: any[]) => void;
    optimizeContent: (..._args: any[]) => void;
    showAISuggestions: (..._args: any[]) => void;
};
