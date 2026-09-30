import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { formatBytes, getFileTypeConfig } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import documentService from '../../services/documentService';

const CATEGORIES = [
  'Certificates',
  'Academic',
  'Career',
  'Identity',
  'Projects',
  'Personal',
  'Other'
];

export default function DocumentUploadModal({ isOpen, onClose, onUploaded }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Certificates');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetState = () => {
    setSelectedFile(null);
    setIsDragging(false);
    setTitle('');
    setCategory('Certificates');
    setDescription('');
    setUploading(false);
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (uploading) return;
    resetState();
    onClose();
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File exceeds the 25MB maximum limit.');
      return;
    }
    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim() || selectedFile.name);
      formData.append('category', category);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const uploadedDoc = await documentService.uploadDocument(formData, (percent) => {
        setUploadProgress(percent);
      });

      toast.success('Document uploaded securely!');
      if (onUploaded) onUploaded(uploadedDoc);
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const fileTypeCfg = selectedFile ? getFileTypeConfig(selectedFile.type, selectedFile.name) : null;
  const IconComp = fileTypeCfg?.icon || FileText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Document"
      description="Store, categorize, and protect your important files in LifeOS."
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? `Uploading (${uploadProgress}%)...` : 'Upload to Vault'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Drag and Drop Zone */}
        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag and drop your file here, or <span className="text-indigo-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, PNG, JPG, DOCX, ZIP, CSV, TXT up to 25 MB
            </p>
          </div>
        ) : (
          /* Selected File Preview Box */
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${fileTypeCfg.color}`}>
                <IconComp className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-medium text-indigo-600">{fileTypeCfg.label}</span>
                </div>
              </div>
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Uploading document...</span>
              <span className="text-indigo-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <Input
          label="Document Title"
          placeholder="e.g. Stanford Master's Degree Transcript"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
          disabled={uploading}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">Description / Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant notes, issue dates, verification links, or expiration dates..."
            rows={2}
            disabled={uploading}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none disabled:opacity-60"
          />
        </div>
      </div>
    </Modal>
  );
}
