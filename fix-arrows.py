import re
with open('src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("<ArrowRight size={14} />\n          </Link>", "<ArrowRight size={14} color=\"#fff\" />\n          </Link>")
content = content.replace("<ArrowRight size={13} />", "<ArrowRight size={13} color=\"#fff\" />")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

