// Types from ARCHITETTURA.md

export type PlanType = 'free' | 'starter' | 'pro' | 'unlimited';
export type CaseStatus = 'new' | 'in_progress' | 'completed' | 'archived';
export type DocumentDirection = 'incoming' | 'outgoing';
export type ChatScope = 'dashboard' | 'case';
export type ChatRole = 'user' | 'assistant';
export type DocumentType =
  | 'school_absence'
  | 'employer_letter'
  | 'landlord_letter'
  | 'authority_letter'
  | 'generic';

export interface Profile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  preferred_language: string;
  preferred_country: string;
  sender_full_name: string | null;
  sender_address: string | null;
  sender_city: string | null;
  sender_postal_code: string | null;
  sender_country: string | null;
  plan: PlanType;
  is_admin: boolean;
  is_family: boolean;
  plan_override: PlanType | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  title: string;
  authority: string | null;
  aktenzeichen: string | null;
  deadline: string | null;
  status: CaseStatus;
  letter_text: string | null;
  draft_response: string | null;
  tone: string;
  chat_history: unknown[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  case_id: string | null;
  bucket: string;
  path: string;
  file_name: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  ocr_text: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  direction: DocumentDirection;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  case_id: string | null;
  scope: ChatScope;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  attachment_type: 'image' | 'pdf' | null;
  created_at: string;
}

export interface UserProfileContext {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  senderFullName?: string;
  senderAddress?: string;
  senderCity?: string;
  senderPostalCode?: string;
  senderCountry?: string;
}

export interface CaseContext {
  id: string;
  title: string;
  authority?: string;
  aktenzeichen?: string;
  deadline?: string;
  letterText?: string;
  draftResponse?: string;
  documents?: Array<{
    id: string;
    fileName?: string;
    rawText?: string;
    direction: string;
    createdAt: string;
  }>;
}
