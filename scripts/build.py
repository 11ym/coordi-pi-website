"""Prepare the static site and set share metadata for its deployment URL."""

import argparse
from html import escape
import json
from pathlib import Path
import shutil
import subprocess
from urllib.parse import urlsplit


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="", help="Public site URL, including the repository path")
    args = parser.parse_args()
    base_url = args.base_url.strip().rstrip("/")
    if base_url:
        parser.error("Anonymous builds do not accept an identifying deployment URL")
    if base_url:
        parsed = urlsplit(base_url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc or parsed.query or parsed.fragment:
            parser.error("--base-url must be an HTTP(S) URL without a query or fragment")

    root = Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "public-files.json").read_text())
    allowed = set(manifest["repository"])
    site_files = set(manifest["site"])
    tracked = set(subprocess.check_output(
        ["git", "-C", str(root), "ls-files", "-z"], text=True
    ).rstrip("\0").split("\0"))
    unexpected = tracked - allowed
    if unexpected:
        raise SystemExit("Unreviewed tracked files: " + ", ".join(sorted(unexpected)))
    if not site_files <= allowed:
        raise SystemExit("Site files must be included in the repository allowlist")
    forbidden = {".pdf", ".tex", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".tar", ".gz", ".7z", ".pem", ".key", ".pt", ".pth", ".ckpt", ".safetensors"}
    for name in allowed:
        path = root / name
        if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(root):
            raise SystemExit("Invalid publication file: " + name)
        if path.suffix.lower() in forbidden or path.name.startswith(".env"):
            raise SystemExit("Private document or artifact is not publishable: " + name)
    output = root / "_site"
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    for name in sorted(site_files):
        target = output / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(root / name, target)

    if base_url:
        page = output / "index.html"
        html = page.read_text(encoding="utf-8")
        url = escape(base_url + "/", quote=True)
        metadata = f'<meta property="og:url" content="{url}">\n  <link rel="canonical" href="{url}">'
        html = html.replace("<!-- Deployment URL metadata -->", metadata)
        html = html.replace('content="assets/hero.webp"', f'content="{url}assets/hero.webp"')
        page.write_text(html, encoding="utf-8")
    print(f"Website ready: {output}")


if __name__ == "__main__":
    main()
