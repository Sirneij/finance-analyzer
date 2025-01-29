from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageFont

# Create new image with white background
img = Image.new('RGB', (1000, 420), 'white')
draw = ImageDraw.Draw(img)

# Download logos
django_url = 'https://static.djangoproject.com/img/logos/django-logo-positive.png'
celery_url = 'https://docs.celeryq.dev/en/stable/_static/celery_512.png'

django_response = requests.get(django_url)
celery_response = requests.get(celery_url)

django_logo = Image.open(BytesIO(django_response.content))
celery_logo = Image.open(BytesIO(celery_response.content))

# Resize logos
django_logo = django_logo.resize((250, 125))
celery_logo = celery_logo.resize((200, 200))

# Load system font
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 60)
vs_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 40)
recursive_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 80)

# Position logos
img.paste(django_logo, (150, 110), django_logo.convert('RGBA'))
img.paste(celery_logo, (650, 110), celery_logo.convert('RGBA'))

# Add VS text
vs_text = 'VS'
vs_bbox = draw.textbbox((0, 0), vs_text, font=vs_font)
vs_width = vs_bbox[2] - vs_bbox[0]
draw.text((500 - vs_width / 2, 190), vs_text, font=vs_font, fill='black')

# Add recursive symbol
recursive_text = '∞'
recursive_bbox = draw.textbbox((0, 0), recursive_text, font=recursive_font)
recursive_width = recursive_bbox[2] - recursive_bbox[0]
draw.text(
    (500 - recursive_width / 2, 320), recursive_text, font=recursive_font, fill='black'
)

# Save image
img.save('tech_banner.png')
