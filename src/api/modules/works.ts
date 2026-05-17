import { request } from '@/api/request';
import type {
  DocumentOut,
  WorkCreate,
  WorkOut,
  WorkUpdate,
} from '@/api/types';

export function listWorks() {
  return request<WorkOut[]>('/api/works');
}

export function createWork(body: WorkCreate) {
  return request<WorkOut>('/api/works', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getWork(workId: number) {
  return request<WorkOut>(`/api/works/${workId}`);
}

export function updateWork(workId: number, body: WorkUpdate) {
  return request<WorkOut>(`/api/works/${workId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteWork(workId: number) {
  return request<void>(`/api/works/${workId}`, {
    method: 'DELETE',
  });
}

export function listDocuments(workId: number) {
  return request<DocumentOut[]>(`/api/works/${workId}/documents`);
}

export function uploadDocument(workId: number, file: File) {
  const form = new FormData();
  form.append('file', file);
  return request<DocumentOut>(`/api/works/${workId}/documents`, {
    method: 'POST',
    body: form,
  });
}

export function deleteDocument(workId: number, documentId: number) {
  return request<void>(`/api/works/${workId}/documents/${documentId}`, {
    method: 'DELETE',
  });
}
