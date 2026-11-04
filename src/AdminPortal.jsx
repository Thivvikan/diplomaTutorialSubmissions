import React, { useState, useEffect, useCallback } from 'react';
import './AdminPortal.css';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  FolderCheck,
  Download,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Plus,
  Save,
  Shield,
  BarChart3,
  ArrowUpRight,
  FileSpreadsheet,
  Layers,
  Hash,
  CreditCard,
  User,
  Calendar,
  SortAsc,
  SortDesc,
} from 'lucide-react';

const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby0gLNmkDZRvCC2HLblBudoo1N0EpTzoRw6LOJ1vdLE81YO5qI_l93HeKFsp3lDqOrQug/exec';
const TARGET_DRIVE_FOLDER_ID = '1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0';
const TARGET_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}?usp=drive_link`;
const DEFAULT_BATCHES = ['Batch 2024', 'Batch 2025', 'Intake 01', 'Intake 02'];
const ADMIN_PASSWORD_KEY = 'admin_portal_password';
const DEFAULT_ADMIN_PASSWORD = 'admin1234';

// ─── Utility ───────────────────────────────────────────────────────────────────
function exportToCSV(rows) {
  const headers = ['Timestamp', 'Batch', 'Reference No', 'NIC', 'Student Name', 'Saved File', 'Original File', 'Size', 'Drive Link'];
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    lines.push(
      [r.timestamp, r.batch, r.refNumber, r.nic, r.name, r.savedFile, r.originalFile, r.fileSize, r.fileUrl]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `submissions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const stored = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
      if (password === stored) {
        onLogin();
      } else {
        setError('Incorrect password. Please try again.');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="login-shield-icon">
          <Shield size={32} />
        </div>
        <h1 className="login-title">Admin Portal</h1>
        <p className="login-subtitle">Diploma Practical Submission System</p>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="login-field">
            <label>Admin Password</label>
            <input
              type="password"
              className="login-input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <RefreshCw size={18} className="spin-icon" />
            ) : (
              <>
                <Shield size={18} />
                <span>Sign In to Admin</span>
              </>
            )}
          </button>
        </form>

        <a href="/" className="login-back-link">
          ← Back to Submission Portal
        </a>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className={`stat-icon-box icon-${color}`}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Submission Detail Modal ───────────────────────────────────────────────────
function SubmissionModal({ submission, onClose }) {
  if (!submission) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Submission Details</div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-icon"><User size={16} /></div>
            <div>
              <div className="detail-label">Student Name</div>
              <div className="detail-value">{submission.name}</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><Layers size={16} /></div>
            <div>
              <div className="detail-label">Batch / Intake</div>
              <div className="detail-value">{submission.batch}</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><Hash size={16} /></div>
            <div>
              <div className="detail-label">Reference No</div>
              <div className="detail-value">{submission.refNumber}</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><CreditCard size={16} /></div>
            <div>
              <div className="detail-label">NIC Number</div>
              <div className="detail-value">{submission.nic}</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><FileText size={16} /></div>
            <div>
              <div className="detail-label">Saved File Name</div>
              <div className="detail-value">{submission.savedFile}</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><FileText size={16} /></div>
            <div>
              <div className="detail-label">Original File Name</div>
              <div className="detail-value">{submission.originalFile}</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><BarChart3 size={16} /></div>
            <div>
              <div className="detail-label">File Size</div>
              <div className="detail-value">{submission.fileSize}</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><Calendar size={16} /></div>
            <div>
              <div className="detail-label">Submitted At</div>
              <div className="detail-value">{submission.timestamp}</div>
            </div>
          </div>
        </div>

        {submission.fileUrl && submission.fileUrl !== '#' && (
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-drive-btn"
          >
            <FolderCheck size={16} />
            <span>Open in Google Drive</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Submissions Table ─────────────────────────────────────────────────────────
function SubmissionsTable({ submissions, onView }) {
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');

  const batches = ['All', ...Array.from(new Set(submissions.map((s) => s.batch).filter(Boolean)))];

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = submissions
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.refNumber?.toLowerCase().includes(q) ||
        s.nic?.toLowerCase().includes(q) ||
        s.batch?.toLowerCase().includes(q);
      const matchBatch = batchFilter === 'All' || s.batch === batchFilter;
      return matchSearch && matchBatch;
    })
    .sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (sortDir === 'asc') return String(va).localeCompare(String(vb));
      return String(vb).localeCompare(String(va));
    });

  const SortBtn = ({ field, label }) => (
    <button className="sort-btn" onClick={() => handleSort(field)}>
      {label}
      {sortField === field ? (
        sortDir === 'asc' ? <SortAsc size={13} /> : <SortDesc size={13} />
      ) : (
        <SortAsc size={13} style={{ opacity: 0.3 }} />
      )}
    </button>
  );

  return (
    <div className="table-section">
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, ref no, NIC, batch…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="filter-row">
          <Filter size={15} />
          {batches.map((b) => (
            <button
              key={b}
              className={`batch-filter-pill ${batchFilter === b ? 'active' : ''}`}
              onClick={() => setBatchFilter(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="result-count">
        Showing <strong>{filtered.length}</strong> of <strong>{submissions.length}</strong> submissions
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="submissions-table">
          <thead>
            <tr>
              <th><SortBtn field="timestamp" label="Date" /></th>
              <th><SortBtn field="batch" label="Batch" /></th>
              <th><SortBtn field="refNumber" label="Ref No" /></th>
              <th><SortBtn field="name" label="Student Name" /></th>
              <th><SortBtn field="nic" label="NIC" /></th>
              <th><SortBtn field="savedFile" label="File" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">
                  <div className="empty-state">
                    <FileText size={32} />
                    <div>No submissions found</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => (
                <tr key={i} className="table-row">
                  <td className="td-date">{s.timestamp}</td>
                  <td><span className="batch-badge">{s.batch}</span></td>
                  <td className="td-mono">{s.refNumber}</td>
                  <td className="td-name">{s.name}</td>
                  <td className="td-mono">{s.nic}</td>
                  <td className="td-file" title={s.savedFile}>{s.savedFile}</td>
                  <td className="td-actions">
                    <button className="action-btn view-btn" onClick={() => onView(s)} title="View details">
                      <Eye size={15} />
                    </button>
                    {s.fileUrl && s.fileUrl !== '#' && (
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn drive-btn"
                        title="Open in Drive"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ apiEndpoint, setApiEndpoint, batches, setBatches }) {
  const [localUrl, setLocalUrl] = useState(apiEndpoint);
  const [localBatches, setLocalBatches] = useState(batches.join(', '));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  const saveGeneral = () => {
    const newBatches = localBatches.split(',').map((b) => b.trim()).filter(Boolean);
    setApiEndpoint(localUrl);
    setBatches(newBatches);
    localStorage.setItem('diploma_apps_script_url', localUrl);
    localStorage.setItem('adminBatches', JSON.stringify(newBatches));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePassword = () => {
    setPwError('');
    if (password.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    localStorage.setItem(ADMIN_PASSWORD_KEY, password);
    setPassword('');
    setConfirmPassword('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2000);
  };

  return (
    <div className="settings-panel">
      <div className="settings-section">
        <h3 className="settings-section-title">
          <Settings size={18} /> Google Apps Script Connection
        </h3>
        <div className="settings-field">
          <label>Apps Script Web App URL</label>
          <input
            type="text"
            className="settings-input"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
          />
          <span className="settings-hint">
            Deploy <code>google-apps-script/Code.gs</code> as a Web App and paste the URL here.
          </span>
        </div>
        <div className="settings-field">
          <label>Google Drive Folder</label>
          <div className="settings-drive-row">
            <code className="drive-id-display">{TARGET_DRIVE_FOLDER_ID}</code>
            <a href={TARGET_DRIVE_FOLDER_URL} target="_blank" rel="noreferrer" className="open-drive-link">
              Open Folder <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">
          <Layers size={18} /> Batch / Intake Management
        </h3>
        <div className="settings-field">
          <label>Batches (comma-separated)</label>
          <input
            type="text"
            className="settings-input"
            value={localBatches}
            onChange={(e) => setLocalBatches(e.target.value)}
            placeholder="Batch 2024, Batch 2025, Intake 01"
          />
          <span className="settings-hint">These will appear in the student submission form dropdown.</span>
        </div>
        <div className="current-batches">
          {localBatches.split(',').map((b) => b.trim()).filter(Boolean).map((b) => (
            <span key={b} className="batch-tag">{b}</span>
          ))}
        </div>
      </div>

      <button className="save-settings-btn" onClick={saveGeneral}>
        {saved ? <><CheckCircle2 size={17} /> Saved!</> : <><Save size={17} /> Save Settings</>}
      </button>

      <div className="settings-section" style={{ marginTop: '32px' }}>
        <h3 className="settings-section-title">
          <Shield size={18} /> Change Admin Password
        </h3>
        {pwError && (
          <div className="login-error" style={{ marginBottom: '12px' }}>
            <AlertCircle size={15} /> {pwError}
          </div>
        )}
        <div className="settings-field">
          <label>New Password</label>
          <input
            type="password"
            className="settings-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />
        </div>
        <div className="settings-field">
          <label>Confirm Password</label>
          <input
            type="password"
            className="settings-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </div>
        <button className="save-settings-btn" onClick={savePassword}>
          {pwSaved ? <><CheckCircle2 size={17} /> Password Updated!</> : <><Shield size={17} /> Update Password</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Portal ─────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [lastFetched, setLastFetched] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState(
    () => localStorage.getItem('diploma_apps_script_url') || DEFAULT_APPS_SCRIPT_URL
  );
  const [batches, setBatches] = useState(() => {
    const stored = localStorage.getItem('adminBatches');
    return stored ? JSON.parse(stored) : [...DEFAULT_BATCHES];
  });

  // ── Fetch submissions from Apps Script ──
  const fetchSubmissions = useCallback(async () => {
    setIsFetching(true);
    setFetchError('');
    try {
      const endpoint = apiEndpoint?.trim().startsWith('http') ? apiEndpoint.trim() : DEFAULT_APPS_SCRIPT_URL;
      const url = `${endpoint}?action=getSubmissions&t=${Date.now()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
        setLastFetched(new Date().toLocaleTimeString());
      } else if (data.error) {
        setFetchError(data.error);
        // load demo data for preview
        setSubmissions(getDemoSubmissions());
      } else {
        setSubmissions(getDemoSubmissions());
        setFetchError('Could not load live data — showing demo records. Connect your Apps Script to see real submissions.');
      }
    } catch {
      setSubmissions(getDemoSubmissions());
      setFetchError('Could not reach Apps Script — showing demo records. Configure the endpoint in Settings.');
    } finally {
      setIsFetching(false);
      setLastFetched(new Date().toLocaleTimeString());
    }
  }, [apiEndpoint]);

  useEffect(() => {
    if (isLoggedIn) fetchSubmissions();
  }, [isLoggedIn, fetchSubmissions]);

  // ── Stats ──
  const totalSubmissions = submissions.length;
  const batchCounts = submissions.reduce((acc, s) => {
    acc[s.batch] = (acc[s.batch] || 0) + 1; return acc;
  }, {});
  const topBatch = Object.entries(batchCounts).sort((a, b) => b[1] - a[1])[0];
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = submissions.filter((s) => s.timestamp?.startsWith(today)).length;

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Shield size={22} /></div>
          <div>
            <div className="sidebar-brand-title">Admin Portal</div>
            <div className="sidebar-brand-sub">Diploma System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="nav-item nav-item-link">
            <ArrowUpRight size={18} />
            <span>Student Portal</span>
          </a>
          <button
            className="nav-item logout-item"
            onClick={() => { setIsLoggedIn(false); setSubmissions([]); }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-title">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'submissions' && 'All Submissions'}
            {activeTab === 'settings' && 'Settings'}
          </div>
          <div className="topbar-actions">
            {lastFetched && (
              <span className="last-fetched">Last updated: {lastFetched}</span>
            )}
            <button
              className="refresh-btn"
              onClick={fetchSubmissions}
              disabled={isFetching}
              title="Refresh submissions"
            >
              <RefreshCw size={16} className={isFetching ? 'spin-icon' : ''} />
              {isFetching ? 'Loading…' : 'Refresh'}
            </button>
            {submissions.length > 0 && activeTab !== 'settings' && (
              <button className="export-btn" onClick={() => exportToCSV(submissions)}>
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </header>

        {/* Fetch Error Banner */}
        {fetchError && (
          <div className="fetch-warning">
            <AlertCircle size={16} />
            <span>{fetchError}</span>
            <button onClick={() => setFetchError('')}><X size={14} /></button>
          </div>
        )}

        {/* Content */}
        <div className="admin-content">
          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="stats-grid">
                <StatCard
                  icon={Users}
                  label="Total Submissions"
                  value={totalSubmissions}
                  color="blue"
                  sub="All time"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Today's Submissions"
                  value={todayCount}
                  color="green"
                  sub={new Date().toLocaleDateString()}
                />
                <StatCard
                  icon={Layers}
                  label="Active Batches"
                  value={Object.keys(batchCounts).length || batches.length}
                  color="purple"
                  sub="Distinct batches"
                />
                <StatCard
                  icon={BarChart3}
                  label="Top Batch"
                  value={topBatch ? `${topBatch[1]}` : '—'}
                  color="amber"
                  sub={topBatch ? topBatch[0] : 'No data'}
                />
              </div>

              {/* Batch breakdown */}
              <div className="dashboard-row">
                <div className="dashboard-card">
                  <div className="dashboard-card-title">
                    <Layers size={16} /> Submissions by Batch
                  </div>
                  {Object.keys(batchCounts).length === 0 ? (
                    <div className="empty-state-sm">No data yet</div>
                  ) : (
                    Object.entries(batchCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([batch, count]) => (
                        <div key={batch} className="batch-row">
                          <span className="batch-row-label">{batch}</span>
                          <div className="batch-row-bar-wrap">
                            <div
                              className="batch-row-bar"
                              style={{ width: `${(count / totalSubmissions) * 100}%` }}
                            />
                          </div>
                          <span className="batch-row-count">{count}</span>
                        </div>
                      ))
                  )}
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-title">
                    <Clock size={16} /> Recent Submissions
                  </div>
                  {submissions.length === 0 ? (
                    <div className="empty-state-sm">No submissions yet</div>
                  ) : (
                    submissions.slice(0, 5).map((s, i) => (
                      <div key={i} className="recent-row" onClick={() => { setSelectedSubmission(s); }}>
                        <div className="recent-avatar">{(s.name || '?')[0].toUpperCase()}</div>
                        <div className="recent-info">
                          <div className="recent-name">{s.name}</div>
                          <div className="recent-meta">{s.batch} · {s.refNumber}</div>
                        </div>
                        <div className="recent-time">{s.timestamp?.split(' ')[1] ?? ''}</div>
                      </div>
                    ))
                  )}
                  {submissions.length > 5 && (
                    <button className="see-all-btn" onClick={() => setActiveTab('submissions')}>
                      See all {submissions.length} submissions →
                    </button>
                  )}
                </div>
              </div>

              {/* Quick links */}
              <div className="quick-links">
                <a href={TARGET_DRIVE_FOLDER_URL} target="_blank" rel="noreferrer" className="quick-link-card">
                  <FolderCheck size={20} />
                  <span>Open Drive Folder</span>
                  <ExternalLink size={14} />
                </a>
                <button className="quick-link-card" onClick={() => setActiveTab('submissions')}>
                  <FileText size={20} />
                  <span>View All Submissions</span>
                  <ArrowUpRight size={14} />
                </button>
                <button className="quick-link-card" onClick={() => setActiveTab('settings')}>
                  <Settings size={20} />
                  <span>Manage Settings</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── SUBMISSIONS ── */}
          {activeTab === 'submissions' && (
            <SubmissionsTable submissions={submissions} onView={setSelectedSubmission} />
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <SettingsPanel
              apiEndpoint={apiEndpoint}
              setApiEndpoint={setApiEndpoint}
              batches={batches}
              setBatches={setBatches}
            />
          )}
        </div>
      </main>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
      )}
    </div>
  );
}

// ─── Demo data (shown when API is unreachable) ────────────────────────────────
function getDemoSubmissions() {
  return [
    { timestamp: '2026-11-01 09:14:22', batch: 'Batch 2024', refNumber: '00001001', nic: '200112345678', name: 'Kasun Perera', savedFile: 'Batch_2024_00001001_Kasun_Perera.pdf', originalFile: 'assignment.pdf', fileSize: '1.2 MB', fileUrl: '#' },
    { timestamp: '2026-11-01 10:33:11', batch: 'Batch 2024', refNumber: '00001002', nic: '991234567V', name: 'Nimali Silva', savedFile: 'Batch_2024_00001002_Nimali_Silva.docx', originalFile: 'practical.docx', fileSize: '0.8 MB', fileUrl: '#' },
    { timestamp: '2026-11-02 08:55:00', batch: 'Batch 2025', refNumber: '00002001', nic: '200298765432', name: 'Ravindu Fernando', savedFile: 'Batch_2025_00002001_Ravindu_Fernando.pdf', originalFile: 'my_practical.pdf', fileSize: '2.1 MB', fileUrl: '#' },
    { timestamp: '2026-11-02 11:20:45', batch: 'Intake 01', refNumber: '00003001', nic: '200156789012', name: 'Dilani Jayawardena', savedFile: 'Intake_01_00003001_Dilani_Jayawardena.pdf', originalFile: 'doc.pdf', fileSize: '1.5 MB', fileUrl: '#' },
    { timestamp: '2026-11-03 14:02:33', batch: 'Intake 02', refNumber: '00004001', nic: '200034567890', name: 'Supun Bandara', savedFile: 'Intake_02_00004001_Supun_Bandara.docx', originalFile: 'submission.docx', fileSize: '0.6 MB', fileUrl: '#' },
    { timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19), batch: 'Batch 2025', refNumber: '00002002', nic: '200311223344', name: 'Tharushi Wickramasinghe', savedFile: 'Batch_2025_00002002_Tharushi_Wickramasinghe.pdf', originalFile: 'practical_work.pdf', fileSize: '3.0 MB', fileUrl: '#' },
  ];
}

