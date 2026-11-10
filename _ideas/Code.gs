// The Ideas board's only backend (the app's Settings, Ideas): a Google Sheet with three tabs.
//   Ideas:       id | title | status (open, planned, shipped) | shown (TRUE/FALSE)   <- you write these rows
//   Votes:       id | voter | when                                                  <- the app writes, one row a vote
//   Suggestions: text | when | build                                                <- the app writes; only you read it
// README.md says how to set it up. (A folder starting with an underscore is not published with the site.)

function doGet(e) {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var ideas = rows(tab(book, "Ideas", ["id", "title", "status", "shown"]));
  var counts = {};
  rows(tab(book, "Votes", ["id", "voter", "when"])).forEach(function (v) { counts[v[0]] = (counts[v[0]] || 0) + 1; });
  var voter = String((e && e.parameter && e.parameter.voter) || "");
  var mine = {};
  if (voter) rows(tab(book, "Votes", ["id", "voter", "when"])).forEach(function (v) { if (v[1] === voter) mine[v[0]] = true; });
  var list = ideas.filter(function (r) { return r[0] && r[1] && String(r[3]).toUpperCase() === "TRUE"; })
    .map(function (r) {
      return { id: String(r[0]), title: String(r[1]), status: String(r[2] || "open"), votes: counts[r[0]] || 0, mine: !!mine[r[0]] };
    });
  return reply({ ok: true, ideas: list });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    if (p.type === "suggest") {
      var text = String(p.text || "").trim().slice(0, 280);
      if (!text) return reply({ ok: false });
      // A leading = + - @ is kept as words, never run as a formula.
      if (/^[=+\-@]/.test(text)) text = "'" + text;
      tab(book, "Suggestions", ["text", "when", "build"]).appendRow([text, new Date(), String(p.build || "").slice(0, 12)]);
      return reply({ ok: true });
    }
    var id = String(p.id || "").slice(0, 40), voter = String(p.voter || "").slice(0, 64);
    if (!id || !voter) return reply({ ok: false });
    var votes = tab(book, "Votes", ["id", "voter", "when"]);
    var data = votes.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][0]) === id && String(data[i][1]) === voter) {
        if (p.type === "unvote") votes.deleteRow(i + 1);
        return reply({ ok: true });
      }
    }
    if (p.type === "vote") votes.appendRow([id, voter, new Date()]);
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function tab(book, name, header) {
  var sheet = book.getSheetByName(name) || book.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  return sheet;
}

function rows(sheet) {
  var values = sheet.getDataRange().getValues();
  return values.slice(1);
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
