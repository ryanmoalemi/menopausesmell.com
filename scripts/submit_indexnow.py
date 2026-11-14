"""Notify IndexNow after a successful deployment; retain hashes to skip unchanged URLs."""
import argparse
import hashlib
import json
from pathlib import Path
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--state', default='.indexnow-state.json')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    settings = json.loads((ROOT / 'data/site-settings.json').read_text())
    config = json.loads((ROOT / 'data/search-services.json').read_text())
    base = settings['public_base_url'].rstrip('/')
    key = config['indexnow_key']
    state_file = Path(args.state)
    previous = json.loads(state_file.read_text()) if state_file.exists() else {}
    current = {}
    for node in ET.fromstring((ROOT / 'sitemap.xml').read_text()).findall('.//{*}loc'):
        url = node.text
        if not url.startswith(base + '/'):
            raise ValueError('Sitemap URL is outside the configured site')
        path = urllib.parse.urlsplit(url).path.strip('/')
        page = ROOT / path / 'index.html'
        current[url] = hashlib.sha256(page.read_bytes()).hexdigest()
    changed = [url for url, digest in current.items() if previous.get(url) != digest]
    removed = [url for url in previous if url not in current]
    urls = changed + removed
    if not urls:
        print('No changed URLs to submit.')
        return
    payload = {'host': urllib.parse.urlsplit(base).netloc, 'key': key,
               'keyLocation': base + '/' + key + '.txt', 'urlList': urls}
    if args.dry_run:
        print(json.dumps({'count': len(urls), 'urls': urls}, indent=2))
        return
    with urllib.request.urlopen(payload['keyLocation'], timeout=30) as response:
        if response.read().decode('utf-8').strip() != key:
            raise ValueError('The live IndexNow key file is not ready')
    request = urllib.request.Request('https://api.indexnow.org/indexnow',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
    with urllib.request.urlopen(request, timeout=60) as response:
        status = response.status
        if status not in (200, 202):
            raise RuntimeError(f'IndexNow returned HTTP {status}')
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(current, indent=2) + '\n')
    print(f'IndexNow received {len(urls)} URLs: HTTP {status}. Receipt does not guarantee indexing.')


if __name__ == '__main__':
    main()
