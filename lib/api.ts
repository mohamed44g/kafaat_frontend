export interface Category {
  id: string;
  title: string;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
}

export interface VideoLesson {
  id: string;
  title: string;
  description: string | null;
  isFree: boolean;
  position: number;
  durationSeconds: number;
  streamStatus: string;
  thumbnailUrl: string | null;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  totalTime: string;
  totalVideo: number;
  isPublished: boolean;
  categoryId: string;
  instructorId: string;
  category: Category;
  instructor: Instructor;
  videos?: VideoLesson[];
}

export interface SubscriptionPlanFeature {
  id: string;
  planId: string;
  featureKey: string;
  label: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  durationMonths: number;
  isActive: boolean;
  features: SubscriptionPlanFeature[];
}

export interface BankTransferSettings {
  bankName: string;
  accountHolderName: string;
  iban: string;
  accountNumber: string | null;
  swiftCode: string | null;
  supportWhatsapp: string;
  instructions: string;
  isActive: boolean;
  updatedAt: string;
}

export type LiveSessionStatus =
  | "scheduled"
  | "live"
  | "ended"
  | "canceled"
  | "failed";

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  durationMinutes: number;
  status: LiveSessionStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: unknown };
}

export class BackendError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const backendUrl =
  process.env.BACKEND_API_URL ?? "http://localhost:3001/api/v1";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
    cache: init.cache ?? "no-store",
  });
  const body = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    throw new BackendError(
      response.status,
      body?.error?.code ?? "BACKEND_UNAVAILABLE",
      body?.error?.message ?? "تعذر الاتصال بالخدمة، حاول مرة أخرى.",
      body?.error?.details,
    );
  }
  return body.data;
}

export const getCategories = () => apiFetch<Category[]>("/categories");
export const getCourses = () => apiFetch<Course[]>("/courses");
export const getPlans = () => apiFetch<SubscriptionPlan[]>("/plans");
export const getBankTransferSettings = () =>
  apiFetch<BankTransferSettings>("/bank-transfer");
export const getLiveSessions = () =>
  apiFetch<LiveSession[]>("/live-sessions");

export async function getCourse(slug: string): Promise<Course | null> {
  try {
    return await apiFetch<Course>(`/courses/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) return null;
    throw error;
  }
}

export function formatDuration(totalSeconds: string | number): string {
  const seconds = Number(totalSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "لم تُحدد بعد";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours && minutes) return `${hours} ساعة و ${minutes} دقيقة`;
  if (hours) return `${hours} ساعة`;
  return `${minutes || 1} دقيقة`;
}
