export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface Meal {
  title: string;
  cookingTime: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  visualDescription: string;
}

export interface Recipe {
  title: string;
  time: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}