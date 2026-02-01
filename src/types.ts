'''
export interface ScoreItem {
  score: number;
  feedback: string;
}

export interface Scorecard {
  personalizacao: ScoreItem;
  propostaDeValor: ScoreItem;
  timingFollowUp: ScoreItem;
  cta: ScoreItem;
  gestaoObjecoes: ScoreItem;
}

export interface AnalysisResult {
  overallScore: number;
  scorecard: Scorecard;
  classification: string;
  whatWentWell: string[];
  whatToImprove: string[];
  suggestedNextAction: string;
  improvedScript: string;
}

export interface AnalysisReport extends AnalysisResult {
  id: string;
  date: string;
  originalConversation: string;
}

export interface LiveSuggestion {
  signal: string;
  suggestedResponse: string;
  nextAction: string;
}

export interface ProspectingScriptResponse {
  scripts: string[];
  explanation: string;
}

export interface AppConfig {
  evolution: {
    baseUrl: string;
    apiKey: string;
    instanceName: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
}
'''
