import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DocumentOut, DocumentStatus } from '@/api/types';
import { getErrorMessage } from '@/api/utils';
import {
  useDeleteDocumentMutation,
  useDocumentsQuery,
  useUploadDocumentMutation,
  useWorkQuery,
} from '@/hooks/useWorks';
import { formatBytes, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

function statusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'pending':
      return '处理中';
    case 'done':
      return '已完成';
    case 'failed':
      return '失败';
  }
}

function statusVariant(
  status: DocumentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'done':
      return 'default';
    case 'failed':
      return 'destructive';
  }
}

export default function WorkDocumentsPage() {
  const { workId: workIdParam } = useParams();
  const workId = Number(workIdParam);
  const validWorkId = Number.isFinite(workId) && workId > 0;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentOut | null>(null);

  const { data: work, isLoading: workLoading, error: workError } =
    useWorkQuery(validWorkId ? workId : 0);
  const { data: documents, isLoading: docsLoading, error: docsError } =
    useDocumentsQuery(validWorkId ? workId : 0);
  const uploadMutation = useUploadDocumentMutation(validWorkId ? workId : 0);
  const deleteMutation = useDeleteDocumentMutation(validWorkId ? workId : 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validWorkId) return;
    uploadMutation.mutate(file, {
      onSettled: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const handleDelete = () => {
    if (!deleteDoc) return;
    deleteMutation.mutate(deleteDoc.id, {
      onSuccess: () => setDeleteDoc(null),
    });
  };

  if (!validWorkId) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-destructive">无效的作品 ID</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/works">返回作品列表</Link>
        </Button>
      </div>
    );
  }

  const isLoading = workLoading || docsLoading;
  const loadError = workError ?? docsError;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" className="w-fit px-0" asChild>
          <Link to="/works">← 返回作品列表</Link>
        </Button>
        <h1 className="text-2xl font-semibold">
          {workLoading ? '加载中…' : (work?.title ?? '文档管理')}
        </h1>
        <p className="text-sm text-muted-foreground">
          上传 .txt 或 .md 文件入库并向量化
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="max-w-xs"
          disabled={uploadMutation.isPending}
          onChange={handleFileChange}
        />
        {uploadMutation.isPending && (
          <span className="text-sm text-muted-foreground">上传处理中…</span>
        )}
      </div>

      {uploadMutation.isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(uploadMutation.error)}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">加载文档列表…</p>
      )}

      {loadError && (
        <p className="text-sm text-destructive">{getErrorMessage(loadError)}</p>
      )}

      {!isLoading && !loadError && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>分块数</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  暂无文档，请选择文件上传
                </TableCell>
              </TableRow>
            )}
            {documents?.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="max-w-[200px] truncate font-medium">
                  {doc.filename}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={statusVariant(doc.status)}>
                      {statusLabel(doc.status)}
                    </Badge>
                    {doc.status === 'failed' && doc.error_message && (
                      <span
                        className={cn(
                          'max-w-[180px] truncate text-xs text-destructive',
                        )}
                        title={doc.error_message}
                      >
                        {doc.error_message}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{doc.chunk_count}</TableCell>
                <TableCell>{formatBytes(doc.size_bytes)}</TableCell>
                <TableCell>{formatDateTime(doc.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDoc(doc)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={deleteDoc !== null}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除文档？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除「{deleteDoc?.filename}」及其向量数据，此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '删除中…' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
