/**
 * Database Models
 * Basic type definitions for database entities
 */

export interface DatabaseModel {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModel extends DatabaseModel {
  name: string;
  email?: string;
  preferences?: Record<string, any>;
}

export interface InterviewModel extends DatabaseModel {
  sessionId: string;
  studioId: string;
  status: 'preparing' | 'active' | 'paused' | 'completed' | 'cancelled';
  responses: any[];
  analysis?: Record<string, any>;
}

export interface JobModel extends DatabaseModel {
  title: string;
  company: string;
  location: string;
  type: string;
  description?: string;
  requirements?: string[];
  salary?: string;
  remote: boolean;
  source: string;
  postedDate: Date;
}