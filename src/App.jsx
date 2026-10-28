import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  Trash2,
  User,
  Hash,
  CreditCard,
  Layers,
  ArrowRight,
  RotateCcw,
  FolderCheck,
  X,
  FileSpreadsheet
} from 'lucide-react';

const TARGET_DRIVE_FOLDER_ID = "1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0";
const TARGET_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}?usp=drive_link`;

const DEFAULT_BATCHES = ["Batch 2024", "Batch 2025", "Intake 01", "Intake 02"];
const ALLOWED_EXTS = ['pdf', 'doc', 'docx'];
const MAX_FILE_SIZE_MB = 25;

export default function App() {
  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentBatch, setStudentBatch] = useState('');
  const [studentRef, setStudentRef] = useState('');
  const [studentNic, setStudentNic] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // UI & Network State
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionReceipt, setSubmissionReceipt] = useState(null);

  // Settings State
  const [apiEndpoint, setApiEndpoint] = useState(() => {
    return localStorage.getItem('diploma_apps_script_url') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMessage('');
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!ALLOWED_EXTS.includes(ext)) {
      setErrorMessage(`Invalid format (.${ext}). Only Word (.doc, .docx) and PDF (.pdf) documents are allowed.`);
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File size (${sizeInMB.toFixed(2)} MB) exceeds the maximum limit of ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim() || !studentBatch.trim() || !studentRef.trim() || !studentNic.trim()) {
      setErrorMessage('Please fill out all required fields before submitting.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please attach your assignment document (PDF or Word).');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);
    setProgressStatus('Reading document from device...');

    try {
      // 1. Convert file to Base64
      const base64Content = await readFileAsBase64(selectedFile, (progress) => {
        setUploadProgress(Math.min(45, 15 + Math.round(progress * 30)));
      });

      const payload = {
        name: studentName.trim(),
        batch: studentBatch.trim(),
        refNumber: studentRef.trim().toUpperCase(),
        nic: studentNic.trim().toUpperCase(),
        fileName: selectedFile.name,
        mimeType: selectedFile.type || 'application/octet-stream',
        fileData: base64Content,
        fileSize: selectedFile.size,
        targetFolderId: TARGET_DRIVE_FOLDER_ID
      };

      setUploadProgress(60);
      setProgressStatus('Uploading document to Google Drive...');

      // 2. Dispatch to Apps Script Web App or Simulated Test Mode
      if (apiEndpoint && apiEndpoint.trim().startsWith('http')) {
        // Live Google Apps Script Web App API
        const response = await fetch(apiEndpoint.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8' // avoids CORS preflight blockage on Google Apps Script
          },
          body: JSON.stringify(payload)
        });

        setUploadProgress(90);
        setProgressStatus('Finalizing Google Sheet entry...');

        const result = await response.json();
        if (result && result.success) {
          setUploadProgress(100);
          setProgressStatus('Complete!');
          setSubmissionReceipt({
            name: studentName,
            batch: studentBatch,
            refNumber: studentRef,
            nic: studentNic,
            fileName: result.fileName || selectedFile.name,
            fileUrl: result.fileUrl || TARGET_DRIVE_FOLDER_URL,
            timestamp: result.timestamp || new Date().toLocaleString()
          });
        } else {
          throw new Error(result?.error || 'Failed to complete submission on Google Drive.');
        }
      } else {
        // Instant Preview / Demonstration Mode
        await new Promise((r) => setTimeout(r, 1200));
        setUploadProgress(90);
        setProgressStatus('Finalizing submission in test preview...');
        await new Promise((r) => setTimeout(r, 600));
        setUploadProgress(100);

        const sanitizedName = studentName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        const simulatedFileName = `${studentBatch}_${studentRef.toUpperCase()}_${sanitizedName}.${ext}`;

        setSubmissionReceipt({
          name: studentName,
          batch: studentBatch,
          refNumber: studentRef,
          nic: studentNic,
          fileName: simulatedFileName,
          fileUrl: TARGET_DRIVE_FOLDER_URL,
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(`Upload error: ${err.message || 'Network error occurred. Please check Google Apps Script deployment URL.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const readFileAsBase64 = (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(e.loaded / e.total);
        }
      };
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const resetForm = () => {
    setStudentName('');
    setStudentBatch('');
    setStudentRef('');
    setStudentNic('');
    setSelectedFile(null);
    setUploadProgress(0);
    setProgressStatus('');
    setErrorMessage('');
    setSubmissionReceipt(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveApiEndpoint = (url) => {
    setApiEndpoint(url);
    localStorage.setItem('diploma_apps_script_url', url.trim());
  };

  const fileExt = selectedFile ? selectedFile.name.split('.').pop().toLowerCase() : '';
  const isPdf = fileExt === 'pdf';
  const fileSizeMb = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0';

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="brand-badge">
          <span className="brand-dot"></span>
          <span>Google Drive Connected</span>
        </div>

        <div className="nav-actions">
          <a
            href={TARGET_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="drive-link-btn"
            title="Open Target Drive Folder"
          >
            <FolderCheck size={16} />
            <span>Open Drive Folder</span>
            <ExternalLink size={13} />
          </a>

          <button
            className="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure Apps Script Endpoint"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="main-content">
        <div className="portal-card">
          
          {!submissionReceipt ? (
            <div>
              {/* Header */}
              <div className="card-header">
                <div className="portal-tag">
                  Official Submission Portal
                </div>
                <h1 className="card-title">Diploma Practical Submission</h1>
                <p className="card-subtitle">
                  Upload your practical assignment directly to the instructor's Google Drive storage.
                </p>
              </div>

              {/* Destination Pill */}
              <div className="destination-pill">
                <FolderCheck size={15} style={{ color: '#38bdf8' }} />
                <span>Target Folder: </span>
                <a href={TARGET_DRIVE_FOLDER_URL} target="_blank" rel="noreferrer">
                  1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="feedback-alert alert-error">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name <span className="required-badge">*</span>
                  </label>
                  <div className="input-container">
                    <span className="input-leading-icon">
                      <User size={18} />
                    </span>
                    <input
                      id="name"
                      type="text"
                      className="text-input"
                      required
                      placeholder="e.g. Kasun Chamara Perera"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>
                  <div className="input-hint">Enter your name as officially registered with the institute.</div>
                </div>

                {/* Batch & Reference Number */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="batch">
                      Batch / Intake <span className="required-badge">*</span>
                    </label>
                    <div className="input-container">
                      <span className="input-leading-icon">
                        <Layers size={18} />
                      </span>
                      <input
                        id="batch"
                        type="text"
                        className="text-input"
                        required
                        placeholder="e.g. 2024 / Batch 02"
                        value={studentBatch}
                        onChange={(e) => setStudentBatch(e.target.value)}
                      />
                    </div>
                    {/* Quick Selection Pills */}
                    <div className="batch-pills">
                      {DEFAULT_BATCHES.map((b) => (
                        <button
                          key={b}
                          type="button"
                          className={`batch-pill-btn ${studentBatch === b ? 'active' : ''}`}
                          onClick={() => setStudentBatch(b)}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="refNo">
                      Reference / Index No <span className="required-badge">*</span>
                    </label>
                    <div className="input-container">
                      <span className="input-leading-icon">
                        <Hash size={18} />
                      </span>
                      <input
                        id="refNo"
                        type="text"
                        className="text-input"
                        required
                        placeholder="e.g. DIP/2024/048"
                        value={studentRef}
                        onChange={(e) => setStudentRef(e.target.value)}
                      />
                    </div>
                    <div className="input-hint">Your diploma student identification index.</div>
                  </div>
                </div>

                {/* NIC Number */}
                <div className="form-group">
                  <label className="form-label" htmlFor="nic">
                    NIC Number <span className="required-badge">*</span>
                  </label>
                  <div className="input-container">
                    <span className="input-leading-icon">
                      <CreditCard size={18} />
                    </span>
                    <input
                      id="nic"
                      type="text"
                      className="text-input"
                      required
                      placeholder="e.g. 200112345678 or 991234567V"
                      value={studentNic}
                      onChange={(e) => setStudentNic(e.target.value)}
                    />
                  </div>
                  <div className="input-hint">National Identity Card number for verification.</div>
                </div>

                {/* Document Upload Zone */}
                <div className="form-group">
                  <label className="form-label">
                    Practical Document (.pdf, .docx, .doc) <span className="required-badge">*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />

                  {!selectedFile ? (
                    <div
                      className={`dropzone ${isDragOver ? 'dragover' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <div className="dropzone-icon-box">
                        <UploadCloud size={24} />
                      </div>
                      <div className="dropzone-text">
                        Drag and drop your file here, or <span className="dropzone-highlight">browse</span>
                      </div>
                      <div className="dropzone-subtext">
                        Supported formats: PDF, Word (Max size: {MAX_FILE_SIZE_MB} MB)
                      </div>

                      <div className="file-type-chips">
                        <span className="file-chip chip-pdf">PDF Document (.pdf)</span>
                        <span className="file-chip chip-word">Word Document (.docx, .doc)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="selected-file-box">
                      <div className="selected-file-left">
                        <div className={`file-badge-icon ${isPdf ? 'badge-pdf' : 'badge-doc'}`}>
                          {isPdf ? 'PDF' : 'DOC'}
                        </div>
                        <div className="file-details-meta">
                          <div className="file-display-name" title={selectedFile.name}>
                            {selectedFile.name}
                          </div>
                          <div className="file-display-size">
                            {fileSizeMb < 1 ? `${(selectedFile.size / 1024).toFixed(1)} KB` : `${fileSizeMb} MB`}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={removeFile}
                        title="Remove file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Live Upload Progress */}
                {isSubmitting && (
                  <div className="upload-progress-box">
                    <div className="progress-info-row">
                      <span>{progressStatus}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-indicator-bar"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-caption">
                      Uploading directly to your Google Drive folder...
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-action-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw size={18} className="spin-icon" />
                      <span>Processing Submission...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Assignment to Drive</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Success Receipt Screen */
            <div className="success-screen">
              <div className="success-icon-badge">
                <CheckCircle2 size={40} />
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '6px' }}>
                Submission Received!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem' }}>
                Your practical work has been uploaded and logged successfully.
              </p>

              <div className="receipt-box">
                <div className="receipt-item-row">
                  <span className="receipt-col-label">Student Name</span>
                  <span className="receipt-col-value">{submissionReceipt.name}</span>
                </div>
                <div className="receipt-item-row">
                  <span className="receipt-col-label">Batch / Intake</span>
                  <span className="receipt-col-value">{submissionReceipt.batch}</span>
                </div>
                <div className="receipt-item-row">
                  <span className="receipt-col-label">Reference No</span>
                  <span className="receipt-col-value">{submissionReceipt.refNumber}</span>
                </div>
                <div className="receipt-item-row">
                  <span className="receipt-col-label">NIC Number</span>
                  <span className="receipt-col-value">{submissionReceipt.nic}</span>
                </div>
                <div className="receipt-item-row">
                  <span className="receipt-col-label">File Saved As</span>
                  <span className="receipt-col-value">{submissionReceipt.fileName}</span>
                </div>
                <div className="receipt-item-row">
                  <span className="receipt-col-label">Submitted At</span>
                  <span className="receipt-col-value">{submissionReceipt.timestamp}</span>
                </div>
              </div>

              <div className="receipt-actions">
                <a
                  href={submissionReceipt.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-drive"
                >
                  <FolderCheck size={18} />
                  <span>Open in Google Drive</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  className="btn-new-submission"
                  onClick={resetForm}
                >
                  <RotateCcw size={16} />
                  <span>Submit Another Document</span>
                </button>
              </div>
            </div>
          )}

        </div>

        <footer className="footer-bar">
          Connected to Google Drive Folder: <code>{TARGET_DRIVE_FOLDER_ID}</code> &bull; Diploma Practical System
        </footer>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Google Drive Connection Settings</div>
              <button className="modal-close-btn" onClick={() => setIsSettingsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '18px', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              This React application connects to your Google Drive folder:
              <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', wordBreak: 'break-all' }}>
                <strong>Folder ID:</strong> {TARGET_DRIVE_FOLDER_ID}<br />
                <a href={TARGET_DRIVE_FOLDER_URL} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>
                  Open Google Drive Folder &rarr;
                </a>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Google Apps Script Web App URL
              </label>
              <input
                type="text"
                className="text-input"
                style={{ paddingLeft: '14px' }}
                placeholder="https://script.google.com/macros/s/.../exec"
                value={apiEndpoint}
                onChange={(e) => saveApiEndpoint(e.target.value)}
              />
              <div className="input-hint">
                Deploy <code>google-apps-script/Code.gs</code> as a Web App (Access: Anyone) and paste the URL here. Leave empty for test mode.
              </div>
            </div>

            <button
              className="submit-action-btn"
              style={{ padding: '12px', marginTop: '16px' }}
              onClick={() => setIsSettingsOpen(false)}
            >
              Save & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
