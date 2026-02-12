import React from 'react';

export enum ToolId {
  STYLE_DNA = 'style_dna',
  TWEET_GEN = 'tweet_gen'
}

export interface NavItem {
  id: ToolId;
  label: string;
  icon: React.ReactNode;
}

export type TweetMode = 'TWEET' | 'REPLY';

export interface TweetAnalysis {
  improvedVersion: string;
  critique: string[]; // List of points regarding the draft
  explanation: string; // Why the improvement works
  hashtags: string[];
  score: number; // 0-100 score of the original draft
  reactionSearchQuery?: string; // Specific English query for image search
  memeKeywordsArabic?: string; // Specific Arabic query for local memes
  memeCaption?: string; // A funny caption for the meme in Arabic
}

export interface UserStyle {
  id: string;
  name: string;
  description: string; // The analysis from Gemini
  traits: string[];
}

export type WritingFramework = 'FREESTYLE' | 'AIDA' | 'PAS' | 'STORY' | 'BAB';

export interface UserProfile {
  name: string;
  handle: string;
  avatarUrl: string;
  isConnected: boolean;
  stats: {
    followers: string;
    impressions: string;
    engagement: string;
  }
}

export interface TaskCard {
  id: string;
  title: string;
  category: 'High' | 'Medium' | 'Low';
  type: 'Thread' | 'Tweet' | 'Poll' | 'Image';
  description: string;
  status: 'pending' | 'completed';
  date: string;
  progress: number;
}