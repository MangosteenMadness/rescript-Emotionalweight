/**
 * Google Apps Script for Emotional Weight Assessment Lead Capture
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Sheets and create a new spreadsheet
 * 2. Name the first sheet "Leads" 
 * 3. Add headers in row 1: Timestamp | Email | Score | Category | Answers
 * 4. Go to Extensions > Apps Script
 * 5. Paste this code and save
 * 6. Click Deploy > New deployment
 * 7. Select "Web app" as the type
 * 8. Set "Execute as" to "Me"
 * 9. Set "Who has access" to "Anyone"
 * 10. Click Deploy and copy the Web App URL
 * 11. Paste the URL in your index.html where it says YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
 */

// Handle POST requests from the assessment form
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Calculate score category
    const category = getScoreCategory(data.score);
    
    // Format answers as string
    const answersStr = JSON.stringify(data.answers);
    
    // Append row to sheet
    sheet.appendRow([
      new Date().toISOString(),  // Timestamp
      data.email,                 // Email
      data.score,                 // Score
      category,                   // Category
      answersStr                  // Raw answers (JSON)
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, score: data.score, category: category }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "OK", message: "Emotional Weight Assessment API is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get score category based on score value
function getScoreCategory(score) {
  if (score <= 15) {
    return "Light Load - Emotional Balance";
  } else if (score <= 30) {
    return "Moderate Weight - Room for Growth";
  } else if (score <= 45) {
    return "Heavy Burden - Healing Needed";
  } else {
    return "Overwhelming Weight - Urgent Support";
  }
}

// Optional: Send email notification for high-score leads
function sendAlertEmail(email, score, category) {
  const recipientEmail = "YOUR_EMAIL@example.com"; // Change to your email
  
  if (score > 45) { // Only for overwhelmed leads
    const subject = "🚨 High Priority Lead - Emotional Weight Assessment";
    const body = `
A new lead completed the Emotional Weight Assessment with a high score.

Email: ${email}
Score: ${score}/60
Category: ${category}

This person may benefit from immediate outreach.
    `;
    
    MailApp.sendEmail(recipientEmail, subject, body);
  }
}

// Test function - run this to verify sheet access
function testSetup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
  if (sheet) {
    Logger.log("✅ Sheet 'Leads' found!");
    Logger.log("Headers: " + sheet.getRange(1, 1, 1, 5).getValues());
  } else {
    Logger.log("❌ Sheet 'Leads' not found. Please create it.");
  }
}
