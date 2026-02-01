
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

export interface BusinessStats {
  totalAnalyzed: number;
  averageScore: number;
  hotOpportunities: number;
  topImprovementArea: string;
}

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

export interface EvolutionChat {
  id: string;
  name: string;
  unreadCount: number;
}

export interface EvolutionMessage {
  key: { remoteJid: string };
  message: { conversation?: string; extendedTextMessage?: { text: string } };
  pushName: string;
  fromMe: boolean;
}
