import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWork,
  deleteDocument,
  deleteWork,
  getWork,
  listDocuments,
  listWorks,
  updateWork,
  uploadDocument,
} from '@/api/modules/works';
import type { WorkCreate, WorkUpdate } from '@/api/types';
import { useWorkStore } from '@/store/useWorkStore';

export const worksQueryKey = ['works'] as const;

export function documentsQueryKey(workId: number) {
  return ['works', workId, 'documents'] as const;
}

export function useWorksQuery() {
  return useQuery({
    queryKey: worksQueryKey,
    queryFn: listWorks,
  });
}

export function useWorkQuery(workId: number) {
  return useQuery({
    queryKey: [...worksQueryKey, workId],
    queryFn: () => getWork(workId),
    enabled: workId > 0,
  });
}

export function useCreateWorkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: WorkCreate) => createWork(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKey });
    },
  });
}

export function useUpdateWorkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, body }: { workId: number; body: WorkUpdate }) =>
      updateWork(workId, body),
    onSuccess: (_data, { workId }) => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKey });
      void queryClient.invalidateQueries({ queryKey: [...worksQueryKey, workId] });
    },
  });
}

export function useDeleteWorkMutation() {
  const queryClient = useQueryClient();
  const activeWorkId = useWorkStore((s) => s.activeWorkId);
  const clearActiveWork = useWorkStore((s) => s.clearActiveWork);

  return useMutation({
    mutationFn: (workId: number) => deleteWork(workId),
    onSuccess: (_data, workId) => {
      if (activeWorkId === workId) clearActiveWork();
      void queryClient.invalidateQueries({ queryKey: worksQueryKey });
    },
  });
}

export function useDocumentsQuery(workId: number) {
  return useQuery({
    queryKey: documentsQueryKey(workId),
    queryFn: () => listDocuments(workId),
    enabled: workId > 0,
  });
}

export function useUploadDocumentMutation(workId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadDocument(workId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey(workId) });
    },
  });
}

export function useDeleteDocumentMutation(workId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => deleteDocument(workId, documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey(workId) });
    },
  });
}
