"""
Generate high-resolution PWA icons for AirplaneMode (192x192, 512x512, apple-touch-icon)
"""
import os
from PIL import Image, ImageDraw, ImageFont

ICONS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

def draw_luxury_airplane_icon(size):
    # Create high-res image with dark obsidian background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw rounded dark obsidian background with subtle border
    radius = int(size * 0.22)
    # Background gradient approximation
    draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=(11, 17, 32, 255), outline=(56, 189, 248, 80), width=max(2, size // 96))
    
    # Draw glowing accent circle behind the plane
    center = size // 2
    glow_r = int(size * 0.32)
    draw.ellipse([center - glow_r, center - glow_r, center + glow_r, center + glow_r], fill=(14, 165, 233, 40), outline=(56, 189, 248, 100), width=max(1, size // 150))
    
    # Draw stylized supersonic jet icon in cyan and amber
    # Coordinates normalized from 0 to 1
    poly_pts = [
        (0.50, 0.20),  # Nose
        (0.54, 0.38),
        (0.85, 0.60),  # Right wing tip
        (0.82, 0.68),
        (0.55, 0.58),
        (0.55, 0.76),
        (0.68, 0.85),  # Right tail tip
        (0.64, 0.90),
        (0.50, 0.83),  # Tail center
        (0.36, 0.90),
        (0.32, 0.85),  # Left tail tip
        (0.45, 0.76),
        (0.45, 0.58),
        (0.18, 0.68),
        (0.15, 0.60),  # Left wing tip
        (0.46, 0.38),
    ]
    
    scaled_pts = [(int(x * size), int(y * size)) for x, y in poly_pts]
    
    # Draw plane body with vibrant cyan glow
    draw.polygon(scaled_pts, fill=(56, 189, 248, 255), outline=(255, 255, 255, 220))
    
    # Draw golden cockpit / core line
    core_pts = [
        (int(0.50 * size), int(0.24 * size)),
        (int(0.50 * size), int(0.62 * size))
    ]
    draw.line(core_pts, fill=(245, 158, 11, 255), width=max(2, size // 50))
    
    return img

# Generate icons
for s in [192, 512]:
    icon = draw_luxury_airplane_icon(s)
    icon.save(os.path.join(ICONS_DIR, f"icon-{s}.png"), "PNG")
    print(f"Generated icons/icon-{s}.png")

apple_icon = draw_luxury_airplane_icon(180)
apple_icon.save(os.path.join(ICONS_DIR, "apple-touch-icon.png"), "PNG")
print("Generated icons/apple-touch-icon.png")
