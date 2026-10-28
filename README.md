# 🎓 Diploma Practical Submission Portal (React + Google Drive)

A modern, high-performance React application that collects practical assignment submissions from students and uploads them directly to your specified **Google Drive Folder**:

🔗 **Connected Google Drive Folder:**  
[Open Drive Folder (ID: 1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0)](https://drive.google.com/drive/folders/1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0?usp=drive_link)

---

## ⚡ Features

- **Direct Drive Integration**: Connects straight to your Google Drive folder (`1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0`).
- **Student Information Collected**:
  - Full Name (Institute registered)
  - Batch / Intake (with quick-select tags: Batch 2024, Batch 2025, Intake 01, Intake 02)
  - Reference / Index Number (e.g. `DIP/2024/048`)
  - NIC Number (National Identity Card verification)
  - Practical Document (Word `.docx`, `.doc` or PDF `.pdf`)
- **Automated Organization**:
  - Standardized file naming: `[Batch]_[RefNumber]_[StudentName].[ext]`
  - Batch subfolders inside your Drive folder
  - Automated logging in Google Sheets with clickable links to the uploaded files
- **Design & User Experience**:
  - Dark glassmorphism interface with Plus Jakarta Sans & Outfit typography
  - Drag-and-drop file upload with live file preview and size calculation
  - Real-time progress bar with animated status updates
  - Instant submission receipt screen with direct link to Google Drive

---

## 📂 Project Structure

```
diploma-practical-submission/
├── src/
│   ├── App.jsx            # Main React component with submission state & Drive linking
│   ├── App.css            # Component styles & glassmorphic aesthetics
│   ├── index.css          # Design system, CSS variables & typography
│   └── main.jsx           # React DOM root
├── google-apps-script/
│   ├── Code.gs            # Apps Script API backend configured with your Drive Folder ID
│   ├── Index.html         # Standalone Apps Script web view (optional)
│   └── SETUP_GUIDE.md     # 2-minute deployment guide for Apps Script
├── package.json
└── vite.config.js
```

---

## 🚀 How to Run Locally

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔗 Connecting with Google Drive

The frontend connects to your Drive folder via the Google Apps Script bridge in `google-apps-script/Code.gs`:

1. Open **[script.google.com](https://script.google.com)** and create a new project.
2. Copy & paste the code from **[google-apps-script/Code.gs](google-apps-script/Code.gs)** (which is already configured with your Drive folder ID: `1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0`).
3. Click **Deploy** > **New deployment** > **Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Copy the deployed Web App URL and paste it in the React app's **Settings (⚙️ icon)** on the top right.
5. All student files will flow straight into your Google Drive folder and log into your spreadsheet automatically!
