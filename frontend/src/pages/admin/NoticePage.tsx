import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  AlertTriangle, Megaphone, X, Check,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '@/api/admin';
import { formatDate } from '@/utils/time';
import type { Notice } from '@/types/admin';

/* ── 모달 ── */
const NoticeModal = ({
  initial, onClose, onSave,
}: {
  initial: Partial<Notice> | null;
  onClose: () => void;
  onSave: (data: Omit<Notice, 'noticeId' | 'createdAt'>) => Promise<void>;
}) => {
  const [title, setTitle]           = useState(initial?.title ?? '');
  const [content, setContent]       = useState(initial?.content ?? '');
  const [isImportant, setIsImportant] = useState(initial?.isImportant ?? false);
  const [isVisible, setIsVisible]   = useState(initial?.isVisible ?? true);
  const [isSaving, setIsSaving]     = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('제목을 입력해 주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해 주세요.'); return; }
    setIsSaving(true);
    try {
      await onSave({ title: title.trim(), content: content.trim(), isImportant, isVisible });
      onClose();
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="ad-card w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">{initial?.noticeId ? '공지사항 수정' : '새 공지사항 작성'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 min-h-0"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 text-sm font-medium">제목 *</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="공지 제목을 입력하세요" maxLength={60}
              className="ad-input" autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 text-sm font-medium">내용 *</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용을 입력하세요" rows={5}
              className="ad-textarea"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer ad-card p-3 border border-gray-100">
              <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4" style={{ accentColor: 'var(--kiosk-orange)' }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">중요 공지</p>
                <p className="text-xs text-gray-400">키오스크 상단 강조</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer ad-card p-3 border border-gray-100">
              <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)}
                className="w-4 h-4" style={{ accentColor: 'var(--kiosk-orange)' }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">키오스크 표시</p>
                <p className="text-xs text-gray-400">해제 시 숨김</p>
              </div>
            </label>
          </div>

          {error && (
            <p className="text-red-500 text-sm flex items-center gap-1.5">
              <AlertTriangle size={13} /> {error}
            </p>
          )}

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="ad-btn-secondary flex-1 py-2.5 text-sm">취소</button>
            <button type="submit" disabled={isSaving} className="ad-btn-primary flex-[2] py-2.5 text-sm disabled:opacity-50">
              {isSaving ? '저장 중...' : (initial?.noticeId ? '수정 완료' : '등록하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── 삭제 확인 ── */
const DeleteConfirm = ({ notice, onConfirm, onCancel }: {
  notice: Notice; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
    <div className="ad-card max-w-sm w-full p-6 text-center shadow-xl">
      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
        <Trash2 size={20} className="text-red-500" />
      </div>
      <p className="text-lg font-black text-gray-900 mb-1">공지사항 삭제</p>
      <p className="text-gray-500 text-sm mb-5">
        <span className="font-bold text-gray-800">"{notice.title}"</span><br />
        삭제 후에는 복구할 수 없습니다.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="ad-btn-secondary flex-1 py-2.5 text-sm">취소</button>
        <button onClick={onConfirm} className="ad-btn-danger flex-[2] py-2.5 text-sm">삭제하기</button>
      </div>
    </div>
  </div>
);

/* ── 메인 ── */
export const NoticePage = () => {
  const [notices, setNotices]       = useState<Notice[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [modal, setModal]           = useState<'create' | Notice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [toast, setToast]           = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const load = () => { fetchNotices().then(setNotices).finally(() => setIsLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<Notice, 'noticeId' | 'createdAt'>) => {
    if (typeof modal === 'object' && modal !== null && 'noticeId' in modal) {
      await updateNotice(modal.noticeId, data);
      showToast('공지사항이 수정되었습니다.');
    } else {
      await createNotice(data);
      showToast('공지사항이 등록되었습니다.');
    }
    load();
  };

  const handleToggleVisible = async (n: Notice) => {
    await updateNotice(n.noticeId, { isVisible: !n.isVisible });
    setNotices((prev) => prev.map((x) => x.noticeId === n.noticeId ? { ...x, isVisible: !x.isVisible } : x));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteNotice(deleteTarget.noticeId);
    setNotices((prev) => prev.filter((n) => n.noticeId !== deleteTarget.noticeId));
    setDeleteTarget(null);
    showToast('공지사항이 삭제되었습니다.');
  };

  const visibleCount = notices.filter((n) => n.isVisible).length;

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">공지사항 관리</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              총 {notices.length}개 · 키오스크 표시 {visibleCount}개
            </p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="ad-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Plus size={15} /> 새 공지 작성
          </button>
        </div>

        {/* 목록 */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="ad-card flex items-center justify-center py-12 text-gray-400">불러오는 중...</div>
          ) : notices.length === 0 ? (
            <div className="ad-card flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Megaphone size={32} />
              <p className="text-sm">등록된 공지사항이 없습니다.</p>
              <button onClick={() => setModal('create')} className="text-sm min-h-0 font-semibold" style={{ color: 'var(--kiosk-orange)' }}>
                첫 공지 작성하기 →
              </button>
            </div>
          ) : (
            notices.map((n) => (
              <div
                key={n.noticeId}
                className={`ad-card p-4 border-l-4 transition-all ${
                  n.isImportant ? 'border-l-orange-500' : 'border-l-gray-200'
                } ${!n.isVisible ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {n.isImportant && (
                        <span className="text-[10px] font-black bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full" style={{ color: 'var(--kiosk-orange)' }}>
                          📢 중요
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        n.isVisible
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                        {n.isVisible ? '표시 중' : '숨김'}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="font-bold text-gray-900">{n.title}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{n.content}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleVisible(n)}
                      title={n.isVisible ? '숨기기' : '표시하기'}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors min-h-0"
                    >
                      {n.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => setModal(n)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors min-h-0"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(n)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors min-h-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modal !== null && (
        <NoticeModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          notice={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white border border-gray-200 shadow-xl text-gray-900 text-sm px-4 py-3 rounded-xl">
          <Check size={15} className="text-green-500 flex-shrink-0" />
          {toast}
        </div>
      )}
    </AdminLayout>
  );
};
