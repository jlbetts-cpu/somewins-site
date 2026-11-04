// The waitlist's only backend: each signup from somewins.xyz becomes a row in
// the Google Sheet this script is attached to. README.md says how to set it up.
// (A folder starting with an underscore is not published with the site.)

function doPost(e) {
  var params = (e && e.parameter) || {};

  // The form's hidden field: only a bot fills it. It gets the same answer as
  // anyone, so it has no reason to try again.
  if (params.website) return reply({ ok: true });

  var email = String(params.email || "").trim().toLowerCase();
  // Starting with a letter or digit also means Sheets cannot read one as a formula.
  if (email.length > 254 || !/^[a-z0-9][^\s@]*@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply({ ok: false, error: "email" });
  }

  // One at a time, so two signups of one address cannot both pass the check.
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(["Email", "Joined"]);
    var known = sheet.getRange("A:A").createTextFinder(email).matchEntireCell(true).findNext();
    if (!known) sheet.appendRow([email, new Date()]);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
