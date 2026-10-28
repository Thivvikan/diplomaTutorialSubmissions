# 🎓 Diploma Practical Submission Portal - Quick Setup Guide

This web application allows students to submit practical reports/assignments directly into your **Google Drive** while recording their **Full Name, Batch, Reference Number, NIC Number**, and **File** into a structured **Google Sheet**.

---

## 📁 Files in This Folder

- **[Code.gs](file:///c:/Users/ADMIN/Desktop/diploma%20practical%20submission/Code.gs)**: The Google Apps Script backend that handles Google Drive file storage and Google Sheets logging.
- **[Index.html](file:///c:/Users/ADMIN/Desktop/diploma%20practical%20submission/Index.html)**: The frontend form designed for students with file validation (Word & PDF), drag-and-drop upload, and progress tracking.
- **[preview.html](file:///c:/Users/ADMIN/Desktop/diploma%20practical%20submission/preview.html)**: A local preview version. Double-click to open in any web browser to see the design on your computer immediately.

---

## 🚀 How to Deploy to Google Drive (Under 2 Minutes)

### Step 1: Open Google Apps Script
1. Go to **[script.google.com](https://script.google.com)** in your browser.
2. Sign in with the Google Account where you want to receive the practical submissions.
3. Click **"New project"** (top left).
4. Rename the project from *"Untitled project"* to **"Diploma Practical Submissions"**.

---

### Step 2: Paste the Backend Code (`Code.gs`)
1. In the Apps Script editor, open the file named `Code.gs`.
2. Delete any default code inside it.
3. Open **`Code.gs`** from this folder, copy all code, and paste it into the editor.
4. *(Optional)* If you already have a specific Google Drive folder or Sheet, you can paste their IDs in `CONFIG`:
   ```javascript
   var CONFIG = {
     TARGET_FOLDER_ID: "",     // Leave empty to auto-create folder
     SPREADSHEET_ID: "",       // Leave empty to auto-create sheet
     CREATE_BATCH_SUBFOLDERS: true, // Organizes submissions by batch
     MAX_FILE_SIZE_MB: 25,
     ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx']
   };
   ```
   *Note: If left empty, the script will **automatically create** the folder and sheet for you on the first run!*

---

### Step 3: Add the Frontend HTML (`Index.html`)
1. In the Apps Script left sidebar, click the **`+`** icon next to **Files** and select **HTML**.
2. Name the file **`Index`** (so it creates `Index.html`).
3. Delete any default HTML in it.
4. Open **`Index.html`** from this folder, copy all code, and paste it into the editor.

---

### Step 4: Save & Test Permissions
1. Click the **Save** icon (floppy disk) or press `Ctrl + S`.
2. In the toolbar function dropdown, select **`testSetup`** and click **Run**.
3. Google will ask for authorization:
   - Click **Review permissions**.
   - Choose your Google account.
   - Click **Advanced** > **Go to Diploma Practical Submissions (unsafe)**.
   - Click **Allow**.
4. Check the **Execution log** at the bottom — you will see that your Drive Folder and Google Sheet have been created!

---

### Step 5: Deploy as a Web App (Get the Student Submission Link)
1. Click the blue **Deploy** button (top right) > select **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* and choose **Web app**.
3. Configure the settings:
   - **Description**: `Diploma Submission Portal v1`
   - **Execute as**: **`Me (your_email@gmail.com)`** *(Crucial so students can upload without logging into Google or requesting access)*
   - **Who has access**: **`Anyone`** *(Allows any student with the link to submit)*
4. Click **Deploy**.
5. Copy the **Web app URL** (e.g., `https://script.google.com/macros/s/.../exec`).

**🎉 That's it! Send this Web app URL to your students.**

---

## 📊 Where Do Student Submissions Go?

### 1. Google Drive Folder: `"Diploma Practical Submissions"`
- Files are saved as:
  ```
  [Batch]_[ReferenceNumber]_[StudentName].[ext]
  ```
  *Example:* `Batch_02_DIP_2024_048_Kasun_Perera.pdf`
- If `CREATE_BATCH_SUBFOLDERS: true` is on, files are organized into batch subfolders like:
  - `Batch - 2024`
  - `Batch - Batch 01`

### 2. Google Sheet: `"Diploma Practical Submissions Log"`
Every submission logs a row with:
- **Timestamp**
- **Batch**
- **Reference Number**
- **NIC Number**
- **Student Full Name**
- **Saved File Name**
- **Original File Name**
- **File Size**
- **Direct Link to Google Drive File** (Clickable)
- **Drive File ID**

---

## 🔒 Security & Limits
- **Allowed Formats**: Word (`.doc`, `.docx`) and PDF (`.pdf`) documents.
- **Max File Size**: Up to 25 MB (standard for Google Apps Script file transfers).
- **Execution as Owner**: Students do not need Google Drive storage or special folder permissions; files are written directly into your Drive under your quota.
