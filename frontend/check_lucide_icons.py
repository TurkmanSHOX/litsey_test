import re
from pathlib import Path
root = Path('.')
idx = root / 'node_modules' / 'lucide-react' / 'dist' / 'esm' / 'icons' / 'index.mjs'
exports = set()
with idx.open('r', encoding='utf-8') as f:
    for line in f:
        m = re.match(r"export \{ default as ([A-Za-z0-9_]+) } from .+", line)
        if m:
            exports.add(m.group(1))
imports = {}
for p in root.rglob('*.jsx'):
    text = p.read_text(encoding='utf-8')
    for m in re.finditer(r"import \{([^}]+)\} from 'lucide-react'", text):
        names = [n.strip().split(' as ')[0] for n in m.group(1).split(',') if n.strip()]
        imports[p.relative_to(root).as_posix()] = names
print('exports_count', len(exports))
for path, names in imports.items():
    bad = [name for name in names if name not in exports]
    if bad:
        print(path, bad)
