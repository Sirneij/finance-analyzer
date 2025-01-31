from io import BytesIO
import requests
from PIL import Image, ImageDraw, ImageFont

# Create banner
img = Image.new('RGB', (1200, 630), 'white')
draw = ImageDraw.Draw(img)

# Updated working PNG logo URLs
logos = {
    'nodejs': 'https://seeklogo.com/images/N/nodejs-logo-FBE122E377-seeklogo.com.png',
    'python': 'https://seeklogo.com/images/P/python-logo-A32636CAA3-seeklogo.com.png',
    'svelte': 'https://raw.githubusercontent.com/sveltejs/branding/refs/heads/master/svelte-logo.png',
    'tailwind': 'https://seeklogo.com/images/T/tailwind-css-logo-5AD4175897-seeklogo.com.png',
    'pytorch': 'https://seeklogo.com/images/P/pytorch-logo-84F95D0AF5-seeklogo.com.png',
    'huggingface': 'https://huggingface.co/datasets/huggingface/brand-assets/resolve/main/hf-logo.png',
    'mongodb': 'https://seeklogo.com/images/M/mongodb-logo-655F7D542D-seeklogo.com.png'
}

# Updated positions with better organization
positions = {
    # Frontend - left section (x=200)
    'svelte': (200, 200),    # Primary frontend
    'tailwind': (200, 300),  # Frontend styling
    
    # Backend - center section (x=600)
    'nodejs': (600, 200),    # Primary backend
    'mongodb': (600, 300),   # Database
    
    # AI - right section (x=1000)
    'python': (1000, 200),   # Primary AI
    'pytorch': (1000, 300),  # AI framework
    'huggingface': (1000, 400)  # AI tools
}

section_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 24)
sections = {
    'Frontend': (200, 150),
    'Backend': (600, 150),
    'AI/Analysis': (1000, 150)
}
# Draw section labels
for label, pos in sections.items():
    bbox = draw.textbbox((0, 0), label, font=section_font)
    width = bbox[2] - bbox[0]
    draw.text((pos[0] - width/2, pos[1]), label, font=section_font, fill='#64748B')

# Updated arrows with better positioning
arrows = [
    ((300, 250), (500, 250)),  # Frontend to Backend
    ((700, 250), (900, 250)),  # Backend to AI
]
for start, end in arrows:
    draw.line([start, end], fill='#0F172A', width=3)
    # Draw arrowhead
    draw.polygon([end, (end[0]-15, end[1]-10), (end[0]-15, end[1]+10)], fill='#0F172A')

# Place logos with error handling
def download_and_resize_logo(url, size=(80, 80)):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'image/png,image/jpeg,image/*',
            'Referer': 'https://seeklogo.com/'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        logo = Image.open(BytesIO(response.content))
        # Preserve aspect ratio
        w, h = logo.size
        if w > h:
            new_w = size[0]
            new_h = int(h * (size[0] / w))
        else:
            new_h = size[1]
            new_w = int(w * (size[1] / h))
        
        logo = logo.resize((new_w, new_h), Image.LANCZOS)
        
        # Handle transparency
        if logo.mode in ('RGBA', 'LA'):
            background = Image.new('RGBA', logo.size, 'white')
            logo = Image.alpha_composite(background.convert('RGBA'), logo.convert('RGBA'))
        
        return logo
    except Exception as e:
        print(f"Error loading {url}: {str(e)}")
        return None

# Place logos
for name, pos in positions.items():
    if name in logos:
        logo = download_and_resize_logo(logos[name])
        if logo:
            img.paste(logo, pos, logo.convert('RGBA') if logo.mode == 'RGBA' else None)

# Add titles
title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 48)
subtitle_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 24)

title = "AI-Powered Financial Analyzer"
subtitle = "Built with SvelteKit, NodeJS, and Python"

# Center align text
title_bbox = draw.textbbox((0, 0), title, font=title_font)
subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)

draw.text((600 - title_bbox[2]/2, 50), title, font=title_font, fill='#0F172A')
draw.text((600 - subtitle_bbox[2]/2, 120), subtitle, font=subtitle_font, fill='#64748B')

# Save banner
img.save('tech_stack_banner.png')