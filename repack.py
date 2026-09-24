# 打包 lilyco-brand mpkg：zip 全目录 -> sha256 命名 -> 打印三元组
import zipfile, hashlib, os

root = 'mpkg/lilyco-brand'
out = 'mpkg'
files = []
for base, dirs, fs in os.walk(root):
    for f in fs:
        p = os.path.join(base, f)
        arc = os.path.relpath(p, root).replace(os.sep, '/')
        files.append((p, arc))
files.sort(key=lambda x: x[1])

tmp = os.path.join(out, '_tmp.mpkg')
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as z:
    for p, arc in files:
        z.write(p, arc)

data = open(tmp, 'rb').read()
d = hashlib.sha256(data).hexdigest()
name = 'lilyco-brand-0.3.0-%s.mpkg' % d[:12]
final = os.path.join(out, name)
os.replace(tmp, final)
print('sha256:', d)
print('name  :', name)
print('size  :', os.path.getsize(final))
