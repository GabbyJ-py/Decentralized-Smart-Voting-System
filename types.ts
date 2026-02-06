export interface Voter {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  voterId: string;
  aadhaar: string;
  faceEmbedding: string;
  hasVoted: boolean;
  registrationDate: string;
}

export interface Candidate {
  id: number;
  name: string;
  party: string;
  logo: string;
  votes: number;
}

export interface VoteRecord {
  voterHash: string;
  candidateId: number;
  timestamp: number;
  constituency: string;
}

export interface SystemMetrics {
  accuracy: number;
  successRate: number;
  avgTimePerVote: number;
  totalAttempts: number;
  successfulAuths: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export enum AppView {
  LANDING = 'LANDING',
  REGISTRATION = 'REGISTRATION',
  AUTHENTICATION = 'AUTHENTICATION',
  VOTING = 'VOTING',
  ADMIN = 'ADMIN',
  SEARCH = 'SEARCH'
}