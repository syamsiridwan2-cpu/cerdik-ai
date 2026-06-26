export interface User {
  id: number;
  name: string;
  email: string;
  role: 'guru' | 'siswa' | 'admin';
  poin: number;
  avatar: string | null;
  nisn: string | null;
  created_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: Record<string, unknown>;
  ai_model: string | null;
  poin_cost: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  pin: string;
  duration: number;
  random_soal: boolean;
  random_opsi: boolean;
  auto_save: boolean;
  fullscreen: boolean;
  detect_tab_switch: boolean;
  show_result: boolean;
  status: 'draft' | 'active' | 'closed';
  kkm: number;
  questions_count?: number;
  sessions_count?: number;
  created_at: string;
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question: string;
  options: Record<'A' | 'B' | 'C' | 'D', string>;
  correct_answer: string;
  bobot: number;
  order: number;
}

export interface ExamSession {
  id: number;
  exam_id: number;
  student_name: string;
  nisn: string | null;
  start_at: string;
  end_at: string | null;
  score: number | null;
  status: 'in_progress' | 'completed';
  tab_switch_count: number;
}

export interface ExamAnswer {
  id: number;
  session_id: number;
  question_id: number;
  answer: string | null;
  is_correct: boolean;
}

export interface DashboardStats {
  poin?: number;
  total_documents: number;
  total_exams: number;
  active_exams: number;
  recent_documents: Document[];
  documents_by_type: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
