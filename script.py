from io import BytesIO
import requests
from PIL import Image, ImageDraw, ImageFont

# Create new image with white background
img = Image.new('RGB', (1000, 420), 'white')  # White background
draw = ImageDraw.Draw(img)

try:
    # Using a more reliable Tailwind logo URL
    tailwind_url = 'https://seeklogo.com/images/T/tailwind-css-logo-5AD4175897-seeklogo.com.png'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    response = requests.get(tailwind_url, headers=headers)
    response.raise_for_status()
    
    tailwind_logo = Image.open(BytesIO(response.content))
    
    # Resize logo while maintaining aspect ratio
    basewidth = 150
    wpercent = (basewidth/float(tailwind_logo.size[0]))
    hsize = int((float(tailwind_logo.size[1])*float(wpercent)))
    tailwind_logo = tailwind_logo.resize((basewidth, hsize), Image.LANCZOS)
    
    # Position logo at the top center
    logo_position = (425, 30)
    img.paste(tailwind_logo, logo_position, tailwind_logo.convert('RGBA'))

except Exception as e:
    print(f"Error loading logo: {e}")
    # Continue without logo if there's an error


# Load system font
title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 60)
version_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 50)
arrow_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 80)

# Add version texts
v3_text = "v3"
arrow_text = "->"  # Changed from → to ->
v4_text = "v4"

# Calculate positions
v3_bbox = draw.textbbox((0, 0), v3_text, font=version_font)
arrow_bbox = draw.textbbox((0, 0), arrow_text, font=version_font)  # Use version_font instead of arrow_font
v4_bbox = draw.textbbox((0, 0), v4_text, font=version_font)

# Draw version texts and arrow
draw.text((250, 250), v3_text, font=version_font, fill='#0F172A')
draw.text((475, 250), arrow_text, font=version_font, fill='#0F172A')  # Adjusted position
draw.text((700, 250), v4_text, font=version_font, fill='#0F172A')


# Add "Migration Guide" text at bottom
guide_text = "Migration Guide"
guide_bbox = draw.textbbox((0, 0), guide_text, font=title_font)
guide_width = guide_bbox[2] - guide_bbox[0]
draw.text(
    (500 - guide_width/2, 320), 
    guide_text, 
    font=title_font, 
    fill='#0F172A'  # Dark text
)

# Save image
img.save('tailwind_migration_banner.png')