import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, CloudArrowUp } from 'lucide-react';

export default function AssignmentUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-1">Course Assignment Portal</h3>
      <p className="text-xs text-slate-500 mb-6">Upload PDF or document reports for university coursework verification.</p>

      {!success ? (
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition bg-slate-50/50">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Drag & drop your coursework file here, or browse</p>
            <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, ZIP (Max size: 25MB)</p>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-4 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
          </div>

          {file && (
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">{file.name}</span>
              </div>
              <button 
                type="submit" 
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Submit to Portal'}
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="text-center py-6 bg-emerald-50 rounded-xl border border-emerald-200">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-emerald-900 text-base">Assignment Submitted Successfully!</h4>
          <p className="text-xs text-emerald-700 mt-1">Your submission has been cataloged for University of Turbat review.</p>
          <button 
            onClick={() => { setSuccess(false); setFile(null); }}
            className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}