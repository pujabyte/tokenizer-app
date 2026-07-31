import re
with open('src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("Invest in Assets</span>\n            <ArrowRight size={14} />", "Invest in Assets</span>\n            <ArrowRight size={14} color=\"#fff\" />")
content = content.replace("Start tokenizing</span> <ArrowRight size={14} />", "Start tokenizing</span> <ArrowRight size={14} color=\"#fff\" />")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

