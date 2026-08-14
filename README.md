# A Question For Kristi 💕

A tiny personalized "will you go on a date with me" site: she picks Yes/No
(No gets progressively sadder and eventually dodges the cursor), then on Yes
she picks a date type and a day, and you get a push notification on your
phone with the result.

## 1. Set up the phone notification (ntfy.sh)

No signup required.

1. Install the **ntfy** app on your phone: [Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) / [iOS](https://apps.apple.com/us/app/ntfy/id1625396347).
2. Open the app, tap **+ Subscribe to topic**, and enter a topic name **only you know** — something hard to guess, e.g. `kristi-date-8f3k2j91`. Anyone who knows the topic name can see/send messages on it, so don't use something obvious like `mydate`.
3. Open [script.js](script.js) and replace this line near the top:
   ```js
   const NTFY_TOPIC = "REPLACE_WITH_YOUR_NTFY_TOPIC";
   ```
   with your topic name, e.g. `const NTFY_TOPIC = "kristi-date-8f3k2j91";`
4. That's it — when she confirms a date, the site sends a POST request to `https://ntfy.sh/<your-topic>` and your phone gets a push notification instantly.

You can test it any time by running this in a terminal (replace the topic):
```bash
curl -d "test message" ntfy.sh/kristi-date-8f3k2j91
```

## 2. Customize the content

- Her name / wording: edit the text directly in [index.html](index.html).
- Sad messages while clicking "No": edit the `SAD_MESSAGES` array in [script.js](script.js).
- Date type options: edit the buttons inside `#typeOptions` in [index.html](index.html).
- Colors/theme: edit the CSS variables at the top of [style.css](style.css).

## 3. Try it locally

Just open `index.html` in a browser — no build step needed.

## 4. Deploy to GitHub Pages

```bash
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source → Deploy from a branch → main / (root)**.
Your site will be live at `https://<your-username>.github.io/<repo-name>/`.
