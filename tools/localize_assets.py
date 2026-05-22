from __future__ import annotations

import hashlib
import html
import mimetypes
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
HTML_FILES = [p for p in ROOT.rglob("*.html") if ".git" not in p.parts and "assets" not in p.parts]

REMOTE_HOSTS = {
    "assets.squarespace.com",
    "static1.squarespace.com",
    "images.squarespace-cdn.com",
    "use.typekit.net",
    "p.typekit.net",
    "definitions.sqspcdn.com",
}

BASE = "https://www.bayareaprofessionalcounseling.com"
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36",
    "Accept": "*/*",
}

URL_RE = re.compile(r"""(?:(?:https?:)?//)[^\s"'<>\\)]+""")
ROOT_ASSET_RE = re.compile(r"""(?P<prefix>["'=,\s])(?P<url>/(?:universal|assets|static|@sqs)/[^"' <>,)]+)""")
CSS_URL_RE = re.compile(r"""url\((['"]?)(?P<url>(?!data:|#)[^)'" ]+)\1\)""")


def normalized_url(raw: str, context_url: str | None = None) -> str | None:
    value = html.unescape(raw.strip().rstrip(".,;"))
    if any(token in value for token in ("{", "}", "$", "+this", "+b+", "+g+")):
        return None
    fragment = ""
    if "#" in value:
        value, fragment = value.split("#", 1)
    if value.startswith("//"):
        value = "https:" + value
    elif value.startswith("/"):
        value = "https://static1.squarespace.com" + value
    elif context_url and not value.startswith(("http://", "https://", "data:", "#")):
        parsed = urlparse(context_url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        parent = parsed.path.rsplit("/", 1)[0]
        value = f"{base}{parent}/{value}"
    if not value.startswith(("http://", "https://")):
        return None
    parsed = urlparse(value)
    if parsed.netloc not in REMOTE_HOSTS:
        return None
    if not parsed.path or parsed.path.endswith("/"):
        return None
    return value


def extension_for(url: str, content_type: str | None) -> str:
    path = unquote(urlparse(url).path)
    suffix = Path(path).suffix
    if suffix and len(suffix) <= 8:
        return suffix
    if content_type:
        guessed = mimetypes.guess_extension(content_type.split(";")[0].strip())
        if guessed:
            return guessed
    return ".asset"


def local_name(url: str, content_type: str | None = None) -> str:
    parsed = urlparse(url)
    stem = Path(unquote(parsed.path)).name or parsed.netloc
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-") or "asset"
    suffix = extension_for(url, content_type)
    if not stem.endswith(suffix):
        stem = Path(stem).stem + suffix
    stem = stem[:80]
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
    return f"{Path(stem).stem}-{digest}{suffix}"


def collect_urls_from_text(text: str, context_url: str | None = None) -> set[str]:
    urls = set()
    for match in URL_RE.findall(html.unescape(text)):
        url = normalized_url(match, context_url)
        if url:
            urls.add(url)
    for match in ROOT_ASSET_RE.finditer(text):
        url = normalized_url(match.group("url"), context_url)
        if url:
            urls.add(url)
    for match in CSS_URL_RE.finditer(text):
        url = normalized_url(match.group("url"), context_url)
        if url:
            urls.add(url)
    return urls


def download(url: str) -> tuple[Path | None, str | None, bytes | None]:
    req = Request(url, headers=DEFAULT_HEADERS)
    for attempt in range(3):
        try:
            with urlopen(req, timeout=30) as response:
                content_type = response.headers.get("Content-Type")
                data = response.read()
            path = ASSETS / local_name(url, content_type)
            path.write_bytes(data)
            return path, content_type, data
        except (HTTPError, URLError, TimeoutError) as exc:
            if attempt == 2:
                print(f"FAILED {url}: {exc}", file=sys.stderr)
                return None, None, None
            time.sleep(1 + attempt)
    return None, None, None


def replacement_for(html_file: Path, local_path: Path) -> str:
    return Path(os.path.relpath(local_path, html_file.parent)).as_posix()


def replacement_for_asset_text(local_path: Path) -> str:
    return local_path.name


def rewrite_text(text: str, mapping: dict[str, Path], file_path: Path, asset_context: bool = False) -> str:
    result = text
    ordered = sorted(mapping.items(), key=lambda item: len(item[0]), reverse=True)
    for url, path in ordered:
        replacement = replacement_for_asset_text(path) if asset_context else replacement_for(file_path, path)
        candidates = {url}
        if url.startswith("https://"):
            candidates.add("//" + url.removeprefix("https://"))
        if url.startswith("https://static1.squarespace.com/"):
            candidates.add(url.removeprefix("https://static1.squarespace.com"))
        if url.startswith("https://assets.squarespace.com/"):
            candidates.add(url.removeprefix("https://assets.squarespace.com"))
        for candidate in candidates:
            result = result.replace(candidate, replacement)
            result = result.replace(html.escape(candidate, quote=True), replacement)
            result = result.replace(candidate.replace("&", "&amp;"), replacement)
            if candidate.endswith(".svg"):
                result = result.replace(candidate + "#", replacement + "#")
                result = result.replace(html.escape(candidate + "#", quote=True), replacement + "#")
    return result


def main() -> int:
    ASSETS.mkdir(exist_ok=True)

    urls: set[str] = set()
    for html_file in HTML_FILES:
        urls |= collect_urls_from_text(html_file.read_text(errors="ignore"))

    mapping: dict[str, Path] = {}
    scanned_assets: set[Path] = set()

    while urls:
        url = urls.pop()
        if url in mapping:
            continue
        path, content_type, data = download(url)
        if not path:
            continue
        mapping[url] = path
        if data and (content_type or "").split(";")[0] in {
            "text/css",
            "text/javascript",
            "application/javascript",
            "application/x-javascript",
            "image/svg+xml",
        }:
            scanned_assets.add(path)
            nested = collect_urls_from_text(data.decode("utf-8", errors="ignore"), url)
            urls |= {item for item in nested if item not in mapping}

    for html_file in HTML_FILES:
        text = html_file.read_text(errors="ignore")
        html_file.write_text(rewrite_text(text, mapping, html_file), encoding="utf-8")

    for asset_file in scanned_assets:
        text = asset_file.read_text(errors="ignore")
        asset_file.write_text(rewrite_text(text, mapping, asset_file, asset_context=True), encoding="utf-8")

    print(f"Localized {len(mapping)} assets into {ASSETS.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
