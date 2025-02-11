import numpy as np
from PIL import Image, ImageDraw, ImageFont


def draw_html5_icon(draw, x, y, size=30):
    # Draw HTML5 shield
    points = [
        (x, y),  # top
        (x + size, y),  # top right
        (x + size * 0.9, y + size),  # bottom right
        (x + size * 0.5, y + size * 1.1),  # bottom point
        (x + size * 0.1, y + size),  # bottom left
    ]
    draw.polygon(points, fill=(227, 79, 38))  # HTML5 orange

    # Add "5" text
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', int(size * 0.6))
    except OSError:
        font = ImageFont.load_default()

    text = "5"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text((x + size / 2 - text_width / 2, y + size / 2 - text_height / 2), text, font=font, fill=(255, 255, 255))


def draw_tailwind_icon(draw, x, y, size=30):
    # Draw Tailwind's wave symbol
    color = (56, 189, 248)  # Tailwind blue
    points = [
        (x, y + size * 0.5),
        (x + size * 0.3, y),
        (x + size * 0.7, y + size),
        (x + size, y + size * 0.5),
    ]
    draw.line(points, fill=color, width=3, joint="curve")


def draw_js_icon(draw, x, y, size=30):
    # Draw JS square
    draw.rectangle([(x, y), (x + size, y + size)], fill=(247, 223, 30))  # JavaScript yellow

    # Add "JS" text
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', int(size * 0.5))
    except OSError:
        font = ImageFont.load_default()

    text = "JS"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text((x + size / 2 - text_width / 2, y + size / 2 - text_height / 2), text, font=font, fill=(0, 0, 0))


def create_dashboard_banner(width=1000, height=420):
    # Create base image with dark blue gradient background
    image = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(image)

    # Create gradient background
    for y in range(height):
        # Create a dark blue to slightly lighter blue gradient
        r = int(11 + (y / height) * 10)
        g = int(22 + (y / height) * 15)
        b = int(39 + (y / height) * 20)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Add some 'dashboard elements'
    # Create several semi-transparent white rectangles to simulate cards
    for i in range(3):
        x = 50 + i * 300
        y = 80
        draw.rectangle([(x, y), (x + 250, y + 150)], fill=(255, 255, 255, 30), outline=(255, 255, 255, 80))

        # Add 'chart lines' in the cards
        for j in range(5):
            points = []
            for k in range(5):
                x_point = x + 20 + k * 50
                y_point = y + 50 + np.random.randint(-20, 20)
                points.append((x_point, y_point))

            # Draw lines connecting points
            for p1, p2 in zip(points[:-1], points[1:]):
                draw.line([p1, p2], fill=(29, 185, 84, 180), width=2)

    # Add title text
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 48)
    except OSError:
        font = ImageFont.load_default()

    title = 'Building a Financial Dashboard'
    title_bbox = draw.textbbox((0, 0), title, font=font)
    title_width = title_bbox[2] - title_bbox[0]

    draw.text((width / 2 - title_width / 2, 280), title, font=font, fill=(255, 255, 255))

    try:
        author_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 20)
    except OSError:
        author_font = ImageFont.load_default()

    author = 'by John Owolabi Idogun'
    author_bbox = draw.textbbox((0, 0), author, font=author_font)
    author_width = author_bbox[2] - author_bbox[0]

    draw.text((width / 2 - author_width / 2, 375), author, font=author_font, fill=(150, 150, 150))

    # Add technology icons
    icon_size = 30
    icon_y = 280
    icon_spacing = 40
    start_x = width / 2 + title_width / 2 + 20  # Position icons after the title

    # Draw icons
    draw_html5_icon(draw, start_x, icon_y, icon_size)
    draw_tailwind_icon(draw, start_x + icon_spacing, icon_y, icon_size)
    draw_js_icon(draw, start_x + icon_spacing * 2, icon_y, icon_size)

    return image


if __name__ == '__main__':
    # Create and save the banner
    banner = create_dashboard_banner()
    banner.save('financial_dashboard_banner.png')
