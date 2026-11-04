/**
 * ====================================================================
 * DIPLOMA PRACTICAL SUBMISSION PORTAL - GOOGLE APPS SCRIPT API BACKEND
 * ====================================================================
 * 
 * Target Google Drive Folder:
 * https://drive.google.com/drive/folders/1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0?usp=drive_link
 * Target Folder ID: 1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0
 */

var CONFIG = {
  // Your Google Drive Folder ID provided:
  TARGET_FOLDER_ID: "1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0",

  // Specific Google Sheet ID (leave empty to automatically create a tracking sheet inside the folder)
  SPREADSHEET_ID: "",

  // Set to true if you want separate subfolders created inside the folder for each batch (e.g. "Batch - 2024")
  CREATE_BATCH_SUBFOLDERS: true,

  // Maximum allowed file size in MB  
  MAX_FILE_SIZE_MB: 25,

  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx']
};

/**
 * Handles CORS Preflight OPTIONS requests if needed.
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Serves GET requests.
 * ?action=getSubmissions  → returns all logged rows from the tracking sheet
 * (no action)             → health check
 */
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;

  if (action === "getSubmissions") {
    return getSubmissionsResponse();
  }

  var output = {
    status: "online",
    message: "Diploma Practical Submission API is operational.",
    targetFolderId: CONFIG.TARGET_FOLDER_ID,
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Returns all submission rows from the tracking sheet as JSON.
 */
function getSubmissionsResponse() {
  try {
    // Reuse the existing sheet-finder (pass the root folder)
    var rootFolder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID.trim());
    var sheet = getSubmissionSheet(rootFolder);
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      // Only headers or empty
      return ContentService.createTextOutput(JSON.stringify({ success: true, submissions: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = data[0]; // ["Timestamp","Batch","Reference Number","NIC Number","Student Full Name","Saved File Name","Original File Name","File Size","Drive File Link","Drive File ID"]
    var rows = data.slice(1).map(function(row) {
      return {
        timestamp:    String(row[0] || ""),
        batch:        String(row[1] || ""),
        refNumber:    String(row[2] || ""),
        nic:          String(row[3] || ""),
        name:         String(row[4] || ""),
        savedFile:    String(row[5] || ""),
        originalFile: String(row[6] || ""),
        fileSize:     String(row[7] || ""),
        fileUrl:      String(row[8] || ""),
        fileId:       String(row[9] || "")
      };
    }).reverse(); // newest first

    return ContentService.createTextOutput(JSON.stringify({ success: true, submissions: rows }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests from the React Frontend Application.
 */
function doPost(e) {
  try {
    var rawData;
    if (e && e.postData && e.postData.contents) {
      rawData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      rawData = e.parameter;
    } else {
      throw new Error("No payload data received.");
    }

    var result = processStudentSubmission(rawData);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("doPost Error: " + err.toString());
    var errorResult = {
      success: false,
      error: err.message || err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Core processor for student submission.
 */
function processStudentSubmission(data) {
  if (!data.name || !data.batch || !data.refNumber || !data.nic || !data.fileData || !data.fileName) {
    throw new Error("Missing required fields. Please ensure Full Name, Batch, Reference No, NIC, and Document are all provided.");
  }

  var cleanName = String(data.name).trim();
  var cleanBatch = String(data.batch).trim();
  var cleanRef = String(data.refNumber).trim().toUpperCase();
  var cleanNic = String(data.nic).trim().toUpperCase();
  var originalFileName = String(data.fileName).trim();

  // Validate extension
  var fileExt = originalFileName.split('.').pop().toLowerCase();
  if (CONFIG.ALLOWED_EXTENSIONS.indexOf(fileExt) === -1) {
    throw new Error("Invalid file extension (." + fileExt + "). Only Word (.doc, .docx) and PDF (.pdf) documents are accepted.");
  }

  // Base64 decode
  var decoded = Utilities.base64Decode(data.fileData);
  var sizeMB = decoded.length / (1024 * 1024);

  if (sizeMB > CONFIG.MAX_FILE_SIZE_MB) {
    throw new Error("File size (" + sizeMB.toFixed(2) + " MB) exceeds the maximum limit of " + CONFIG.MAX_FILE_SIZE_MB + " MB.");
  }

  // Standardize file name
  var safeName = cleanName.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_");
  var safeRef = cleanRef.replace(/[^a-zA-Z0-9_\-]/g, "_");
  var safeBatch = cleanBatch.replace(/[^a-zA-Z0-9_\-]/g, "_");
  var newFileName = safeBatch + "_" + safeRef + "_" + safeName + "." + fileExt;

  var blob = Utilities.newBlob(decoded, data.mimeType || 'application/octet-stream', newFileName);

  // Get destination folder (your specified drive folder)
  var targetFolder = getDriveFolder(cleanBatch);

  // Save the file
  var driveFile = targetFolder.createFile(blob);
  driveFile.setDescription(
    "Student: " + cleanName + "\n" +
    "Batch: " + cleanBatch + "\n" +
    "Reference No: " + cleanRef + "\n" +
    "NIC: " + cleanNic + "\n" +
    "Original Name: " + originalFileName + "\n" +
    "Uploaded At: " + new Date().toISOString()
  );

  var fileUrl = driveFile.getUrl();
  var fileId = driveFile.getId();

  // Log in Google Sheet
  var submissionTimestamp = new Date();
  var formattedDate = Utilities.formatDate(submissionTimestamp, Session.getScriptTimeZone() || "GMT+05:30", "yyyy-MM-dd HH:mm:ss");
  
  try {
    var sheet = getSubmissionSheet(targetFolder);
    sheet.appendRow([
      formattedDate,
      cleanBatch,
      cleanRef,
      cleanNic,
      cleanName,
      newFileName,
      originalFileName,
      (sizeMB).toFixed(2) + " MB",
      fileUrl,
      fileId
    ]);

    // Hyperlink
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 9).setValue('=HYPERLINK("' + fileUrl + '", "Open in Drive")');
  } catch (sheetErr) {
    Logger.log("Sheet log warning: " + sheetErr.toString());
  }

  return {
    success: true,
    submissionId: fileId.substring(0, 8),
    fileName: newFileName,
    fileUrl: fileUrl,
    timestamp: formattedDate,
    message: "Practical assignment successfully saved to your Google Drive folder!"
  };
}

/**
 * Accesses the specified Google Drive Folder.
 */
function getDriveFolder(batchName) {
  var folder;
  try {
    folder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID.trim());
  } catch (e) {
    Logger.log("Error accessing TARGET_FOLDER_ID: " + e.toString());
    throw new Error("Could not access the specified Google Drive folder. Please verify permissions.");
  }

  // Batch subfolder organization if enabled
  if (CONFIG.CREATE_BATCH_SUBFOLDERS && batchName) {
    var subfolderName = "Batch - " + batchName;
    var subfolders = folder.getFoldersByName(subfolderName);
    if (subfolders.hasNext()) {
      return subfolders.next();
    } else {
      return folder.createFolder(subfolderName);
    }
  }

  return folder;
}

/**
 * Finds or creates the log spreadsheet in the target folder.
 */
function getSubmissionSheet(parentFolder) {
  var spreadsheet;
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== "") {
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID.trim());
    } catch (e) {
      Logger.log("Specified Spreadsheet ID not found. Creating one.");
    }
  }

  if (!spreadsheet) {
    var sheetName = "Diploma Practical Submissions Log";
    var existingFiles = DriveApp.getFilesByName(sheetName);
    if (existingFiles.hasNext()) {
      spreadsheet = SpreadsheetApp.openById(existingFiles.next().getId());
    } else {
      spreadsheet = SpreadsheetApp.create(sheetName);
      try {
        var file = DriveApp.getFileById(spreadsheet.getId());
        file.moveTo(parentFolder);
      } catch (e) {}
    }
  }

  var sheet = spreadsheet.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Batch",
      "Reference Number",
      "NIC Number",
      "Student Full Name",
      "Saved File Name",
      "Original File Name",
      "File Size",
      "Drive File Link",
      "Drive File ID"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  return sheet;
}

/**
 * Test function to verify access to folder: 1OcWe0x5L9-RVZt_Edi0e2s3kmlL8UTy0
 */
function testConnection() {
  Logger.log("Connecting to target folder...");
  var folder = getDriveFolder("Test Batch");
  Logger.log("Connected successfully! Folder Name: " + folder.getName());
}
