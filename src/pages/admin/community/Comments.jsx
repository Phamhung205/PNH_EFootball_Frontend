import { useState } from 'react';
import {
  MessageSquare, CheckCircle2, AlertTriangle, Clock, Trash2,
  Reply, Filter, ChevronDown, MoreVertical, Flag, User,
  CheckSquare, Square, Shield
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Quản Lý Bình Luận',
    subtitle: 'Kiểm duyệt và quản lý bình luận từ cộng đồng',
    total: 'Tổng bình luận',
    pending: 'Chờ duyệt',
    reported: 'Bị báo cáo',
    filterAll: 'Tất cả',
    filterPending: 'Chờ duyệt',
    filterApproved: 'Đã duyệt',
    filterReported: 'Bị báo cáo',
    approve: 'Duyệt',
    delete: 'Xóa',
    reply: 'Trả lời',
    selectAll: 'Chọn tất cả',
    deleteSelected: 'Xóa đã chọn',
    approveSelected: 'Duyệt đã chọn',
    bulkActions: 'Thao tác hàng loạt',
    selected: 'đã chọn',
    approved: 'Đã duyệt',
    status_pending: 'Chờ duyệt',
    status_reported: 'Bị báo cáo',
    context: 'Bối cảnh',
    noComments: 'Không có bình luận nào',
    confirmDelete: 'Bạn có chắc muốn xóa?',
  },
  en: {
    title: 'Comments Management',
    subtitle: 'Moderate and manage community comments',
    total: 'Total Comments',
    pending: 'Pending',
    reported: 'Reported',
    filterAll: 'All',
    filterPending: 'Pending',
    filterApproved: 'Approved',
    filterReported: 'Reported',
    approve: 'Approve',
    delete: 'Delete',
    reply: 'Reply',
    selectAll: 'Select All',
    deleteSelected: 'Delete Selected',
    approveSelected: 'Approve Selected',
    bulkActions: 'Bulk Actions',
    selected: 'selected',
    approved: 'Approved',
    status_pending: 'Pending',
    status_reported: 'Reported',
    context: 'Context',
    noComments: 'No comments found',
    confirmDelete: 'Are you sure you want to delete?',
  }
};

const sampleComments = [
  {
    id: 1, username: 'NguyenMinh2025', avatar: 'NM', status: 'pending',
    text: 'Trận đấu hôm nay quá hay! Rồng Vàng FC xứng đáng chiến thắng với màn trình diễn xuất sắc.',
    context: 'Trận: Rồng Vàng FC vs Sao Biển FC', time: '5 phút trước', color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 2, username: 'FootballFan88', avatar: 'FF', status: 'approved',
    text: 'Bảng xếp hạng tuần này rất thú vị. Hy vọng Hùm Xám FC sẽ bắt kịp Rồng Vàng trong những vòng tới!',
    context: 'Bảng xếp hạng - Vòng 8', time: '23 phút trước', color: 'from-emerald-500 to-green-600'
  },
  {
    id: 3, username: 'SportAnalyst', avatar: 'SA', status: 'reported',
    text: 'Trọng tài hôm nay thiên vị rõ ràng, cần phải xem xét lại quyết định!!!',
    context: 'Trận: Đại Bàng FC vs Bão Lửa FC', time: '1 giờ trước', color: 'from-red-500 to-rose-600'
  },
  {
    id: 4, username: 'TranThi_Fan', avatar: 'TT', status: 'approved',
    text: 'Nguyễn Văn A ghi bàn quá đỉnh! Cú volley trong trận hôm nay là bàn thắng đẹp nhất giải.',
    context: 'Trận: Rồng Vàng FC vs Hùm Xám FC', time: '2 giờ trước', color: 'from-purple-500 to-violet-600'
  },
  {
    id: 5, username: 'PNHOfficial', avatar: 'PO', status: 'approved',
    text: 'Cảm ơn ban tổ chức đã tổ chức giải đấu tuyệt vời như vậy! Mong giải tiếp theo sẽ còn hay hơn.',
    context: 'Giải đấu PNH 2025', time: '3 giờ trước', color: 'from-amber-500 to-orange-600'
  },
  {
    id: 6, username: 'BongdaVN', avatar: 'BV', status: 'pending',
    text: 'Khi nào có lịch thi đấu vòng tiếp theo vậy admin? Mình chờ mãi không thấy cập nhật.',
    context: 'Giải đấu PNH 2025 - Lịch thi đấu', time: '4 giờ trước', color: 'from-teal-500 to-cyan-600'
  },
  {
    id: 7, username: 'XuanHung123', avatar: 'XH', status: 'reported',
    text: 'Spam spam spam giveaway click here...',
    context: 'Bình luận chung', time: '5 giờ trước', color: 'from-slate-500 to-slate-600'
  },
  {
    id: 8, username: 'CoachPro', avatar: 'CP', status: 'approved',
    text: 'Chiến thuật 4-3-3 của Rồng Vàng FC rất hiệu quả, họ kiểm soát bóng tốt và phản công nhanh.',
    context: 'Phân tích trận đấu - Vòng 7', time: '1 ngày trước', color: 'from-indigo-500 to-blue-600'
  },
];

const filterTabs = ['all', 'pending', 'approved', 'reported'];

const StatusBadge = ({ status, t, dm }) => {
  const configs = {
    pending: { label: t.status_pending, bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
    approved: { label: t.approved, bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
    reported: { label: t.status_reported, bg: 'bg-red-500/20', text: 'text-red-400', icon: Flag },
  };
  const c = configs[status] || configs.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
};

export default function Comments({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [comments, setComments] = useState(sampleComments);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const totalCount = comments.length;
  const pendingCount = comments.filter(c => c.status === 'pending').length;
  const reportedCount = comments.filter(c => c.status === 'reported').length;

  const filtered = activeFilter === 'all'
    ? comments
    : comments.filter(c => c.status === activeFilter);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(c => c.id));
  };

  const handleApprove = (id) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
  };

  const handleDelete = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
    setSelected(prev => prev.filter(x => x !== id));
  };

  const bulkApprove = () => {
    setComments(prev => prev.map(c => selected.includes(c.id) ? { ...c, status: 'approved' } : c));
    setSelected([]);
  };

  const bulkDelete = () => {
    setComments(prev => prev.filter(c => !selected.includes(c.id)));
    setSelected([]);
  };

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';
  const input = dm ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const pillActive = 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold';
  const pillInactive = dm ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

  const filterLabels = {
    all: `${t.filterAll} (${totalCount})`,
    pending: `${t.filterPending} (${pendingCount})`,
    approved: t.filterApproved,
    reported: `${t.filterReported} (${reportedCount})`,
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className={sub}>{t.subtitle}</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t.total, value: totalCount, icon: MessageSquare, bg: 'bg-blue-500/10', icon_color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: t.pending, value: pendingCount, icon: Clock, bg: 'bg-yellow-500/10', icon_color: 'text-yellow-400', border: 'border-yellow-500/20' },
          { label: t.reported, value: reportedCount, icon: AlertTriangle, bg: 'bg-red-500/10', icon_color: 'text-red-400', border: 'border-red-500/20' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`${card} p-5 border ${s.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-black ${text}`}>{s.value}</div>
                  <div className={`text-sm ${sub} mt-1`}>{s.label}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <Icon className={`w-6 h-6 ${s.icon_color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${card} p-5`}>
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map(f => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setSelected([]); }}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${activeFilter === f ? pillActive : pillInactive}`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${sub}`}>{selected.length} {t.selected}</span>
              <button
                onClick={bulkApprove}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.approveSelected}
              </button>
              <button
                onClick={bulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.deleteSelected}
              </button>
            </div>
          )}
        </div>

        {/* Select All Row */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700/30">
            <button onClick={selectAll} className="flex items-center gap-2">
              {selected.length === filtered.length && filtered.length > 0
                ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                : <Square className={`w-4 h-4 ${sub}`} />
              }
              <span className={`text-sm font-medium ${sub}`}>{t.selectAll}</span>
            </button>
          </div>
        )}

        {/* Comments List */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className={`flex flex-col items-center justify-center py-16 ${sub}`}>
              <MessageSquare className="w-12 h-12 opacity-30 mb-3" />
              <p className="text-sm">{t.noComments}</p>
            </div>
          )}
          {filtered.map(comment => {
            const isSelected = selected.includes(comment.id);
            return (
              <div
                key={comment.id}
                className={`p-4 rounded-xl border transition-all ${isSelected
                  ? dm ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-emerald-400 bg-emerald-50'
                  : dm ? 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/50' : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(comment.id)} className="mt-1 flex-shrink-0">
                    {isSelected
                      ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                      : <Square className={`w-4 h-4 ${sub}`} />
                    }
                  </button>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${comment.color} flex items-center justify-center flex-shrink-0 font-black text-white text-sm`}>
                    {comment.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className={`font-bold text-sm ${text}`}>{comment.username}</span>
                      <StatusBadge status={comment.status} t={t} dm={dm} />
                      <span className={`text-xs ${sub} ml-auto`}>{comment.time}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                      {comment.text}
                    </p>
                    <div className={`text-xs flex items-center gap-1 mb-3 ${sub}`}>
                      <MessageSquare className="w-3 h-3" />
                      {comment.context}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.approve}
                        </button>
                      )}
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dm ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
                      >
                        <Reply className="w-3.5 h-3.5" />
                        {t.reply}
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.delete}
                      </button>
                    </div>

                    {/* Reply input */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder={language === 'vi' ? 'Nhập phản hồi...' : 'Type your reply...'}
                          className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 transition-all ${input}`}
                        />
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-sm transition-all"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
