# The Ideas board

Settings, Ideas, in the app: people vote on the ideas you list, and send you new ones. Everything lives in one
Google Sheet that only you can open. Setup takes about two minutes, once.

1. Signed in as somewinsapp@gmail.com, go to [sheets.new](https://sheets.new) and name it "Some Wins ideas".
2. **Extensions, Apps Script.** Replace everything in the editor with `Code.gs`, then save.
3. **Deploy, New deployment**, the gear, **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and
   authorize.
4. Send me the **Web app URL** (it ends in `/exec`). I put it in the app; until then Ideas shows the email button.
5. Open the sheet. The first vote or suggestion makes the tabs; or run `doGet` once in the editor to make them now.

## Using it

- **Ideas tab**, one row an idea: an id you make up (`widgets`, `dark-mode`), the title people see, a status
  (`open`, `planned` or `shipped`) and `TRUE` in shown. Only shown rows appear in the app.
- **Votes tab**: read it, never edit it. Counts are worked out from it.
- **Suggestions tab**: what people sent. Nobody else sees it. Promote a good one by adding it to Ideas.

"Anyone" here means anyone can send the script a vote or a suggestion. It doesn't give anyone access to the sheet.
