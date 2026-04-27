import type { JobApplication, JobPosting } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listJobPostings(
  api: AxiosInstance,
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<{ items: JobPosting[]; page: number; limit: number; total: number }> {
  const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 25 };
  if (params.status) query.status = params.status;
  const response = await api.get<{ items: JobPosting[]; page: number; limit: number; total: number }>(
    "/api/v1/job/postings",
    { params: query }
  );
  return response.data;
}

export async function createJobPosting(
  api: AxiosInstance,
  payload: {
    title: string;
    description: string;
    department: string;
    location: string;
    employmentType: "full_time" | "part_time" | "contract" | "internship";
    experienceLevel?: "entry" | "mid" | "senior" | "lead";
    salaryMinMinor?: number;
    salaryMaxMinor?: number;
    currency?: string;
    tags?: string[];
  }
): Promise<JobPosting> {
  const response = await api.post<JobPosting>("/api/v1/job/postings", payload);
  return response.data;
}

export async function getJobPosting(api: AxiosInstance, postingId: string): Promise<JobPosting> {
  const response = await api.get<JobPosting>(`/api/v1/job/postings/${postingId}`);
  return response.data;
}

export async function updateJobPosting(
  api: AxiosInstance,
  postingId: string,
  payload: {
    title?: string;
    description?: string;
    department?: string;
    location?: string;
    employmentType?: "full_time" | "part_time" | "contract" | "internship";
    experienceLevel?: "entry" | "mid" | "senior" | "lead";
    salaryMinMinor?: number;
    salaryMaxMinor?: number;
    currency?: string;
    tags?: string[];
  }
): Promise<JobPosting> {
  const response = await api.patch<JobPosting>(`/api/v1/job/postings/${postingId}`, payload);
  return response.data;
}

export async function transitionJobPosting(
  api: AxiosInstance,
  postingId: string,
  payload: { to: "draft" | "open" | "closed" | "filled" }
): Promise<JobPosting> {
  const response = await api.post<JobPosting>(`/api/v1/job/postings/${postingId}/transition`, payload);
  return response.data;
}

export async function deleteJobPosting(api: AxiosInstance, postingId: string): Promise<void> {
  await api.delete(`/api/v1/job/postings/${postingId}`);
}

export async function listJobApplications(
  api: AxiosInstance,
  postingId: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: JobApplication[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: JobApplication[]; page: number; limit: number; total: number }>(
    `/api/v1/job/postings/${postingId}/applications`,
    { params: { page: params.page ?? 1, limit: params.limit ?? 25 } }
  );
  return response.data;
}

export async function createJobApplication(
  api: AxiosInstance,
  postingId: string,
  payload: {
    applicantName: string;
    applicantEmail: string;
    resumeUrl?: string;
    coverLetter?: string;
  }
): Promise<JobApplication> {
  const response = await api.post<JobApplication>(`/api/v1/job/postings/${postingId}/applications`, payload);
  return response.data;
}

export async function updateJobApplication(
  api: AxiosInstance,
  applicationId: string,
  payload: { notes?: string }
): Promise<JobApplication> {
  const response = await api.patch<JobApplication>(`/api/v1/job/applications/${applicationId}`, payload);
  return response.data;
}

export async function transitionJobApplication(
  api: AxiosInstance,
  applicationId: string,
  payload: {
    to: "submitted" | "screening" | "interview" | "offered" | "hired" | "rejected" | "withdrawn";
    notes?: string;
  }
): Promise<JobApplication> {
  const response = await api.post<JobApplication>(`/api/v1/job/applications/${applicationId}/transition`, payload);
  return response.data;
}

export async function deleteJobApplication(api: AxiosInstance, applicationId: string): Promise<void> {
  await api.delete(`/api/v1/job/applications/${applicationId}`);
}

export async function getJobInsights(api: AxiosInstance): Promise<{
  counts: {
    draftPostings: number;
    openPostings: number;
    closedPostings: number;
    filledPostings: number;
    totalApplications: number;
    submittedApplications: number;
    hiredApplications: number;
  };
}> {
  const response = await api.get<{
    counts: {
      draftPostings: number;
      openPostings: number;
      closedPostings: number;
      filledPostings: number;
      totalApplications: number;
      submittedApplications: number;
      hiredApplications: number;
    };
  }>("/api/v1/job/insights");
  return response.data;
}
