export interface Agent {
  id: string;
  name: string;
  icon: string;
  cost: number;
  status: 'idle' | 'busy' | 'offline';
  specialty: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress?: number;
}

export interface Deliverable {
  id: string;
  type: 'image' | 'text' | 'file';
  name: string;
  content: string;
  downloadUrl?: string;
}

export interface Transaction {
  id: string;
  total: number;
  breakdown: {
    agent: string;
    amount: number;
  }[];
  burnFee: number;
  status: 'pending' | 'locked' | 'completed';
  txHash?: string;
}

export interface Project {
  id: string;
  userPrompt: string;
  tasks: Task[];
  deliverables: Deliverable[];
  transaction: Transaction;
  status: 'analyzing' | 'in-progress' | 'review' | 'completed';
}
