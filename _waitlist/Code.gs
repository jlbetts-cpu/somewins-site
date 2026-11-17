// The waitlist's only backend: each signup from somewins.xyz becomes a row in
// the Google Sheet this script is attached to. README.md says how to set it up.
// (A folder starting with an underscore is not published with the site.)

function doPost(e) {
  var params = (e && e.parameter) || {};

  // The form's hidden field: only a bot fills it. It gets the same answer as
  // anyone, so it has no reason to try again.
  if (params.website) return reply({ ok: true });

  // Where it came from: the site's form, or the app's Product Updates switch.
  var source = params.source === "app" ? "app" : "site";

  // The app's switch turned off, or its account deleted (2026-11-16). Sent as
  // "unsubscribe", never "email", so a script older than this one answers
  // "error" and cannot read a removal as a signup.
  if (params.unsubscribe !== undefined) {
    var gone = clean(params.unsubscribe);
    if (!gone) return reply({ ok: false, error: "email" });
    return withSheet(function (sheet) {
      var row = find(sheet, gone);
      if (row) sheet.deleteRow(row);
      return reply({ ok: true });
    });
  }

  var email = clean(params.email);
  if (!email) return reply({ ok: false, error: "email" });
  return withSheet(function (sheet) {
    if (!find(sheet, email)) sheet.appendRow([email, new Date(), source]);
    return reply({ ok: true });
  });
}

// Lowercased and checked; "" when it is not an address. Starting with a letter
// or digit also means Sheets cannot read one as a formula.
function clean(value) {
  var email = String(value || "").trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9][^\s@]*@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

// One at a time, so two signups of one address cannot both pass the check.
function withSheet(work) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(["Email", "Joined", "Source"]);
    return work(sheet);
  } finally {
    lock.releaseLock();
  }
}

// The row holding this address, or 0.
function find(sheet, email) {
  var hit = sheet.getRange("A:A").createTextFinder(email).matchEntireCell(true).findNext();
  return hit ? hit.getRow() : 0;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
