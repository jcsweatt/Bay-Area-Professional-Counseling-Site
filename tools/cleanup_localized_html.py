from __future__ import annotations

import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import localize_assets as la  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = [p for p in ROOT.rglob("*.html") if ".git" not in p.parts and "assets" not in p.parts]


def main() -> int:
    for html_file in HTML_FILES:
        text = html_file.read_text(errors="ignore")
        text = re.sub(r"(?:https:)?//assets\.squarespace\.com(\.\./assets/)", r"\1", text)
        text = re.sub(r"https://static1\.squarespace\.com(\.\./assets/)", r"\1", text)
        text = re.sub(r"https:(\.\./assets/)", r"\1", text)

        urls = la.collect_urls_from_text(text)
        for url in sorted(urls, key=len, reverse=True):
            local_path = la.ASSETS / la.local_name(url, None)
            if not local_path.exists():
                continue
            replacement = Path(os.path.relpath(local_path, html_file.parent)).as_posix()
            candidates = {
                url,
                "//" + url.removeprefix("https://"),
                url.replace("&", "&amp;"),
            }
            for candidate in candidates:
                text = text.replace(candidate, replacement)

        text = re.sub(r"https:(\.\./assets/)", r"\1", text)
        text = re.sub(r"https:(assets/)", r"\1", text)

        text = re.sub(
            r'\n?<link rel="preconnect" href="https://(?:images\.squarespace-cdn\.com|use\.typekit\.net|p\.typekit\.net)"[^>]*>',
            "",
            text,
        )
        html_file.write_text(text, encoding="utf-8")

    print(f"Cleaned {len(HTML_FILES)} HTML files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
