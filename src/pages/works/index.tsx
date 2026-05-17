import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/api/utils';
import type { WorkOut } from '@/api/types';
import {
  useCreateWorkMutation,
  useDeleteWorkMutation,
  useUpdateWorkMutation,
  useWorksQuery,
} from '@/hooks/useWorks';
import { formatDateTime } from '@/lib/format';

export default function WorksPage() {
  const { data: works, isLoading, error } = useWorksQuery();
  const createMutation = useCreateWorkMutation();
  const updateMutation = useUpdateWorkMutation();
  const deleteMutation = useDeleteWorkMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');

  const [editWork, setEditWork] = useState<WorkOut | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const [deleteWork, setDeleteWork] = useState<WorkOut | null>(null);

  const handleCreate = () => {
    const title = createTitle.trim();
    if (!title) return;
    createMutation.mutate(
      { title },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setCreateTitle('');
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editWork) return;
    const title = editTitle.trim();
    if (!title) return;
    updateMutation.mutate(
      { workId: editWork.id, body: { title } },
      {
        onSuccess: () => setEditWork(null),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteWork) return;
    deleteMutation.mutate(deleteWork.id, {
      onSuccess: () => setDeleteWork(null),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">作品管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            创建作品并上传 .txt / .md 文档作为知识库
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>新建作品</Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">加载中…</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
      )}

      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {works?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  暂无作品，点击「新建作品」开始
                </TableCell>
              </TableRow>
            )}
            {works?.map((work) => (
              <TableRow key={work.id}>
                <TableCell className="font-medium">{work.title}</TableCell>
                <TableCell>{formatDateTime(work.created_at)}</TableCell>
                <TableCell>{formatDateTime(work.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/works/${work.id}`}>文档</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditWork(work);
                        setEditTitle(work.title);
                      }}
                    >
                      重命名
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteWork(work)}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建作品</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="create-title">标题</Label>
            <Input
              id="create-title"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="作品名称"
              maxLength={256}
            />
            {createMutation.isError && (
              <p className="text-sm text-destructive">
                {getErrorMessage(createMutation.error)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !createTitle.trim()}
            >
              {createMutation.isPending ? '创建中…' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editWork !== null}
        onOpenChange={(open) => !open && setEditWork(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名作品</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-title">标题</Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={256}
            />
            {updateMutation.isError && (
              <p className="text-sm text-destructive">
                {getErrorMessage(updateMutation.error)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWork(null)}>
              取消
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || !editTitle.trim()}
            >
              {updateMutation.isPending ? '保存中…' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteWork !== null}
        onOpenChange={(open) => !open && setDeleteWork(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除作品？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除作品「{deleteWork?.title}」及其全部文档与向量数据，此操作不可恢复。
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
