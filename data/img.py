from pathlib import Path
from PIL import Image

# Carpeta con los PNG originales
INPUT_DIR = Path("tiers")

# Carpeta donde se guardarán los PNG modificados
OUTPUT_DIR = Path("pngs_blancos")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for image_path in INPUT_DIR.glob("*.png"):
    # Abrir imagen y asegurar canal RGBA
    image = Image.open(image_path).convert("RGBA")

    # Fondo blanco completamente opaco
    white_background = Image.new("RGBA", image.size, (255, 255, 255, 255))

    # Componer la imagen sobre el fondo blanco usando su canal alpha
    result = Image.alpha_composite(white_background, image)

    # Guardar como PNG
    output_path = OUTPUT_DIR / image_path.name
    result.save(output_path)

    print(f"Procesado: {image_path.name}")

print("Proceso terminado.")
