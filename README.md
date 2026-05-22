# Bay Area Professional Counseling Site

Offline-capable mirror of the current public Squarespace site at https://www.bayareaprofessionalcounseling.com/.

## Run locally

From this folder:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

The HTML pages point to local files in `assets/` for the scraped Squarespace images, stylesheets, scripts, favicon, and logo.
