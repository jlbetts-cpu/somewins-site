# The waitlist

The form on the home page sends each email to a Google Sheet. Setup takes about two minutes and only happens once.

1. Signed in as somewinsapp@gmail.com, go to [sheets.new](https://sheets.new) and name the sheet "Some Wins waitlist".
2. Choose **Extensions → Apps Script**.
3. Replace everything in the editor with the contents of `Code.gs`, then save.
4. Choose **Deploy → New deployment**. Click the gear icon and choose **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy**, then authorize it when Google asks.
6. Copy the **Web app URL**. It ends in `/exec`.
7. In `index.html`, find `var endpoint = "";` and put the URL between the quotes.

Until step 7 is done, the form tells visitors their signup didn't go through.

"Anyone" here means anyone can send the script a signup. It doesn't give anyone access to the sheet.

## Changing the script later

Edit it, then choose **Deploy → Manage deployments**, edit the deployment, and pick **New version**. This keeps the same URL.

## When the app is out

The list is yours to export from the sheet. To go back to a download button, restore the App Store badge from git. `site/app-store-badge.svg` is still in the site.
