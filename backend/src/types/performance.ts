/**
 * Performance Management Module Types
 * Includes Goal, PerformanceReview, Feedback, and PIP types
 */

// Goal Types
export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  type: 'OKR' | 'KPI';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  weight: number; // Percentage (0-100)
  dueDate: Date;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
  completionPercentage: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateGoalDTO {
  employeeId: string;
  cycleId: string;
  type: 'OKR' | 'KPI';
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  weight: number;
  dueDate: Date;
}

export interface UpdateGoalProgressDTO {
  currentValue: number;
  comment?: string;
}

export interface GoalProgress {
  goalId: string;
  previousValue: number;
  newValue: number;
  completionPercentage: number;
  updatedAt: Date;
  updatedBy: string;
  comment?: string;
}

// Review Cycle Types
export interface ReviewCycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  selfReviewDeadline: Date;
  managerReviewDeadline: Date;
  peerReviewDeadline: Date;
  status: 'Planning' | 'Active' | 'Closed' | 'Finalized';
  createdAt: Date;
  createdBy: string;
}

export interface CreateReviewCycleDTO {
  name: string;
  startDate: Date;
  endDate: Date;
  selfReviewDeadline: Date;
  managerReviewDeadline: Date;
  peerReviewDeadline: Date;
}

// Performance Review Types
export interface PerformanceReview {
  id: string;
  employeeId: string;
  cycleId: string;
  selfRating?: number; // 1-5
  managerRating?: number; // 1-5
  peerRatings: number[]; // Array of 1-5 ratings
  finalRating: number; // Calculated from self, manager, and peer ratings
  comments: string;
  status: 'Pending' | 'Self-Assessment Complete' | 'Manager Review Complete' | 'Finalized';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReviewDTO {
  employeeId: string;
  cycleId: string;
  reviewType: 'Self' | 'Manager' | 'Peer';
  rating: number; // 1-5
  comments: string;
  reviewerId?: string; // For manager and peer reviews
}

// Feedback Types
export interface Feedback {
  id: string;
  toEmployeeId: string;
  fromEmployeeId: string;
  type: 'Positive' | 'Constructive' | 'Neutral';
  content: string;
  isAnonymous: boolean;
  visibility: 'Private' | 'Manager Only' | 'Public';
  createdAt: Date;
}

export interface CreateFeedbackDTO {
  toEmployeeId: string;
  type: 'Positive' | 'Constructive' | 'Neutral';
  content: string;
  isAnonymous: boolean;
  visibility: 'Private' | 'Manager Only' | 'Public';
}

// PIP (Performance Improvement Plan) Types
export interface PIP {
  id: string;
  employeeId: string;
  initiatedBy: string;
  goals: string[]; // Goal IDs
  startDate: Date;
  endDate: Date;
  checkIns: PIPCheckIn[];
  outcome?: 'Completed' | 'Extended' | 'Escalated';
  status: 'Active' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PIPCheckIn {
  id: string;
  pipId: string;
  checkInDate: Date;
  progress: string;
  notes: string;
  status: 'On Track' | 'At Risk' | 'Behind';
  recordedBy: string;
  recordedAt: Date;
}

export interface CreatePIPDTO {
  employeeId: string;
  goals: string[]; // Goal IDs
  startDate: Date;
  endDate: Date;
}

export interface CreatePIPCheckInDTO {
  pipId: string;
  checkInDate: Date;
  progress: string;
  notes: string;
  status: 'On Track' | 'At Risk' | 'Behind';
}

export interface RecordPIPOutcomeDTO {
  pipId: string;
  outcome: 'Completed' | 'Extended' | 'Escalated';
}
