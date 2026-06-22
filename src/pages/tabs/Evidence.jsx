import React, { useState, useRef } from 'react';
import { Upload, Image, Trash2, CheckCircle } from 'lucide-react';

const translations = {
  vi: {
    title: 'Bằng Chứng / Upload Ảnh',
    dropzone: 'Kéo thả ảnh vào đây',
    or: 'hoặc',
    browse: 'Chọn tệp',
    maxFiles: 'Tối đa 5 ảnh',
    maxSize: 'Mỗi ảnh tối đa 5MB',
    uploaded: 'Đã tải lên',
    sizeError: 'Tệp quá lớn! Tối đa 5MB.',
    limitError: 'Đã đạt giới hạn 5 ảnh!',
    noFiles: 'Chưa có ảnh nào được tải lên',
    delete: 'Xóa',
    fileCount: 'ảnh',
  },
  en: {
    title: 'Evidence / Upload Images',
    dropzone: 'Drag & drop images here',
    or: 'or',
    browse: 'Browse Files',
    maxFiles: 'Maximum 5 images',
    maxSize: 'Max 5MB each',
    uploaded: 'Uploaded',
    sizeError: 'File too large! Max 5MB.',
    limitError: 'Maximum 5 files reached!',
    noFiles: 'No images uploaded yet',
    delete: 'Delete',
    fileCount: 'images',
  },
};

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function Evidence({ darkMode = true, language = 'vi' }) {
  const t = translations[language] || translations.vi;

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const clearError = () => {
    setTimeout(() => setError(''), 3000);
  };

  const processFiles = (fileList) => {
    const remaining = MAX_FILES - files.length;
    if (remaining <= 0) {
      setError(t.limitError);
      clearError();
      return;
    }

    const newFiles = Array.from(fileList).slice(0, remaining);

    newFiles.forEach((file) => {
      if (file.size > MAX_SIZE_BYTES) {
        setError(t.sizeError);
        clearError();
        return;
      }

      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles((prev) => {
          if (prev.length >= MAX_FILES) return prev;
          return [
            ...prev,
            {
              name: file.name,
              preview: e.target.result,
              size: (file.size / 1024 / 1024).toFixed(2),
            },
          ];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Image className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
        <span className="ml-auto text-sm text-slate-400">
          {files.length}/{MAX_FILES} {t.fileCount}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-slate-900/80 backdrop-blur-xl border-2 border-dashed rounded-2xl p-8 sm:p-12 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${
          dragOver
            ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
            : 'border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-900/90'
        }`}
      >
        <div
          className={`p-4 rounded-full transition-all duration-300 ${
            dragOver
              ? 'bg-emerald-500/20 scale-110'
              : 'bg-slate-800/60 group-hover:bg-emerald-500/10'
          }`}
        >
          <Upload
            className={`w-10 h-10 transition-all duration-300 ${
              dragOver ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'
            }`}
          />
        </div>

        <div className="text-center">
          <p className={`text-lg font-semibold transition-colors ${
            dragOver ? 'text-emerald-400' : 'text-slate-300'
          }`}>
            {t.dropzone}
          </p>
          <p className="text-slate-500 text-sm mt-1">{t.or}</p>
          <span className="inline-block mt-2 px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-emerald-400 font-semibold group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300">
            {t.browse}
          </span>
        </div>

        <div className="flex gap-4 mt-2">
          <span className="text-xs text-slate-500 bg-slate-800/40 px-3 py-1 rounded-full">
            📁 {t.maxFiles}
          </span>
          <span className="text-xs text-slate-500 bg-slate-800/40 px-3 py-1 rounded-full">
            📦 {t.maxSize}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-semibold animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* Uploaded Files Grid */}
      {files.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            {t.uploaded} ({files.length}/{MAX_FILES})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                {/* Thumbnail */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* File Info */}
                <div className="p-2">
                  <p className="text-xs text-slate-400 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-600">{file.size} MB</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t.noFiles}</p>
        </div>
      )}
    </div>
  );
}
