from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageFont

# Create larger canvas for architecture
img = Image.new('RGB', (1600, 900), 'white')
draw = ImageDraw.Draw(img)

# Component boxes dimensions
box_width = 300
box_height = 300
padding = 20

# Colors
colors = {
    'box_stroke': '#64748B',
    'box_fill': '#F8FAFC',
    'arrow': '#0F172A',
    'text': '#334155',
    'subtitle': '#64748B',
}

# Add logo URLs
logos = {
    'nodejs': 'https://seeklogo.com/images/N/nodejs-logo-FBE122E377-seeklogo.com.png',
    'python': 'https://seeklogo.com/images/P/python-logo-A32636CAA3-seeklogo.com.png',
    'svelte': 'https://raw.githubusercontent.com/sveltejs/branding/refs/heads/master/svelte-logo.png',
    'tailwind': 'https://seeklogo.com/images/T/tailwind-css-logo-5AD4175897-seeklogo.com.png',
    'pytorch': 'https://seeklogo.com/images/P/pytorch-logo-84F95D0AF5-seeklogo.com.png',
    'huggingface': 'https://huggingface.co/datasets/huggingface/brand-assets/resolve/main/hf-logo.png',
    'mongodb': 'https://seeklogo.com/images/M/mongodb-logo-655F7D542D-seeklogo.com.png',
}

# Define components
components = {
    'frontend': {
        'title': 'Frontend (Browser)',
        'x': 200,
        'y': 300,
        'tech': [
            'SvelteKit + Svelte 5',
            'TailwindCSS v4',
            'ChartJS',
            'WebSocket Client',
        ],
        'color': '#FF3E00',  # Svelte color
    },
    'backend': {
        'title': 'Backend Server',
        'x': 650,
        'y': 300,
        'tech': ['NodeJS + Express', 'MongoDB', 'OAuth (GitHub)', 'WebSocket Server'],
        'color': '#68A063',  # Node color
    },
    'ai': {
        'title': 'AI Service',
        'x': 1100,
        'y': 300,
        'tech': [
            'Python + aiohttp',
            'PyTorch + HuggingFace',
            'pdf2image + pytesseract',
        ],
        'color': '#3776AB',  # Python color
    },
}


def download_and_resize_logo(url, size=(60, 60)):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'image/png,image/jpeg,image/*',
            'Referer': 'https://seeklogo.com/',
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

        if logo.mode in ('RGBA', 'LA'):
            background = Image.new('RGBA', logo.size, 'white')
            logo = Image.alpha_composite(
                background.convert('RGBA'), logo.convert('RGBA')
            )

        return logo
    except Exception as e:
        print(f"Error loading logo: {e}")
        return None


def draw_box(x, y, title, tech_list, color, comp_id):
    # Draw box
    box_coords = [(x, y), (x + box_width, y + box_height)]
    draw.rectangle(box_coords, outline=color, fill=colors['box_fill'], width=2)

    # Draw title
    title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 24)
    tech_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 18)

    draw.text((x + padding, y + padding), title, font=title_font, fill=color)

    # Place main technology logo
    if comp_id in ['frontend', 'backend', 'ai']:
        main_logo_url = logos[
            (
                'svelte'
                if comp_id == 'frontend'
                else 'nodejs' if comp_id == 'backend' else 'python'
            )
        ]
        logo = download_and_resize_logo(main_logo_url)
        if logo:
            logo_x = x + box_width - logo.size[0] - padding
            logo_y = y + padding
            img.paste(logo, (logo_x, logo_y), logo.convert('RGBA'))

    # Draw tech list
    for i, tech in enumerate(tech_list):
        draw.text(
            (x + padding, y + 120 + i * 30),
            f"• {tech}",
            font=tech_font,
            fill=colors['text'],
        )


# Draw components
for comp_id, comp in components.items():
    draw_box(
        comp['x'],
        comp['y'],
        comp['title'],
        comp['tech'],
        comp['color'],
        comp_id  # Add the missing comp_id argument
    )

# Update arrows definition
arrows = [
    # Frontend to Backend - REST (one-way)
    {'start': (500, 350), 'end': (650, 350), 'label': 'REST APIs', 'type': 'rest'},
    # Frontend to Backend - WebSocket (bidirectional)
    {'start': (500, 400), 'end': (650, 400), 'label': 'WebSocket', 'type': 'ws'},
    # Backend to AI - WebSocket (bidirectional)
    {'start': (950, 375), 'end': (1100, 375), 'label': 'HTTP/WebSocket', 'type': 'ws'},
]

# Update arrow drawing code
arrow_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 16)
for arrow in arrows:
    # Draw arrow line
    draw.line([arrow['start'], arrow['end']], fill=colors['arrow'], width=2)
    
    # Draw arrowhead(s)
    if arrow['type'] == 'ws':
        # Draw arrowhead at end
        draw.polygon(
            [
                arrow['end'],
                (arrow['end'][0] - 15, arrow['end'][1] - 10),
                (arrow['end'][0] - 15, arrow['end'][1] + 10),
            ],
            fill=colors['arrow'],
        )
        # Draw arrowhead at start for WebSocket
        draw.polygon(
            [
                arrow['start'],
                (arrow['start'][0] + 15, arrow['start'][1] - 10),
                (arrow['start'][0] + 15, arrow['start'][1] + 10),
            ],
            fill=colors['arrow'],
        )
    else:
        # Draw single arrowhead for REST
        draw.polygon(
            [
                arrow['end'],
                (arrow['end'][0] - 15, arrow['end'][1] - 10),
                (arrow['end'][0] - 15, arrow['end'][1] + 10),
            ],
            fill=colors['arrow'],
        )
    
    # Draw label
    label_pos = ((arrow['start'][0] + arrow['end'][0]) / 2, arrow['start'][1] - 20)
    draw.text(
        label_pos, arrow['label'], font=arrow_font, fill=colors['subtitle'], anchor='mm'
    )

# Draw title
title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 48)
title = "AI Financial Analyzer Architecture"
bbox = draw.textbbox((0, 0), title, font=title_font)
title_width = bbox[2] - bbox[0]
draw.text((800 - title_width / 2, 100), title, font=title_font, fill=colors['text'])

# Save diagram
img.save('architecture_diagram.png')
