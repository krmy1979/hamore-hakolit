"""בונה קובץ אחד (dist/index.html) מכל קבצי הפרויקט – לפרסום ולשימוש באייפון"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf8')
css = (root / 'css/style.css').read_text(encoding='utf8')
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
def inline(m):
    return '<script>\n' + (root / m.group(1)).read_text(encoding='utf8') + '\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/index.html').write_text(html, encoding='utf8')
print('dist/index.html', len(html.encode('utf8')), 'bytes')
