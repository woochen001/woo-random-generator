# Littleutility — Random Identity & Word Explorer

A responsive static website for Wasmer Edge. It contains:
- A fictional identity generator (name, date of birth, email, username, city/country, street address, phone).
- An English word explorer that randomly selects and searches words from your own local `public/words.txt` file. It does not call an external dictionary API.

## Project layout

```text
random-tools-wasmer/
├── app.yaml
├── Staticfile
├── settings/
│   └── config.toml
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Important notes

- All identity data is randomly generated in the browser and is fictional demo data. Email addresses use `example.com`.
- This is a frontend-only static website. No database or server-side code is required.
- The word explorer reads `public/words.txt` locally. The included file is a tiny sample so the site works immediately; replace it with your own 30 MB+ word-list file before deploying. It accepts comma-separated quoted words (for example `"the", "of", "and", "to"`) and also handles whitespace/newline-separated words.
- Because your file contains words only, the site can select random words and check whether a searched word exists in the list, but it cannot show definitions, examples, phonetics, or pronunciation audio unless you provide those data separately. The included word list lets the random-word button choose words, but definitions are fetched live.
- Google Fonts are optional styling enhancements. If blocked, the page falls back to system sans-serif fonts.
- The phone/address fields are illustrative fictional samples and must not be used as real contact information or for identity verification.

## Deploy with minimal command-line use

Wasmer's current official static-site guide documents deployment through the Wasmer CLI. If you want to avoid the CLI, the practical alternative is to upload the files to a GitHub repository using GitHub's website, then use Wasmer's dashboard/workflow to import or connect that repository if available for your account.

1. Unzip this archive.
2. Create a new GitHub repository (for example `random-tools`) at https://github.com/new.
3. In the repository, use **Add file → Upload files** and upload the contents of this folder. Keep the `public` and `settings` folders, `Staticfile`, and `app.yaml` at the repository root.
4. Edit `app.yaml`: replace `YOUR_WASMER_USERNAME` with your Wasmer namespace. If Wasmer's import flow creates its own app configuration, use that generated configuration rather than the placeholder.
5. In Wasmer, open https://wasmer.io/apps and look for the create/import/connect-from-GitHub workflow. Connect the repository and follow the dashboard prompts. Dashboard options can change; if your account does not offer repository import/deployment, the supported documented route is the Wasmer CLI.
6. Once deployed, open the app URL Wasmer provides and test both tabs.

### If using Wasmer's official CLI later

Wasmer's static-site guide currently uses `wasmer deploy --template=static-website` to initialize the project, then `wasmer deploy` to publish it. Put the three website files in the template's `public/` directory and preserve the template's configuration files.

Official guide: https://docs.wasmer.io/edge/guides/static-site/
Template: https://wasmer.io/templates/static-website
Dictionary API: https://dictionaryapi.dev/


## Replace the sample vocabulary file

1. Open `public/words.txt` in your extracted project folder and replace it with your full vocabulary file. Keep the filename exactly `words.txt`.
2. Preserve the rest of the project structure and redeploy the folder/repository.
3. The browser loads and indexes the file once per page load. For a file larger than 30 MB, the initial load may take a little time depending on the device and network. The app keeps a compact index rather than creating a separate JavaScript string for every word.

**Important:** This ZIP does not include your 30 MB+ vocabulary file because it has not been uploaded to this chat. It includes only a small sample `words.txt`; replace it with your actual file before deployment.
