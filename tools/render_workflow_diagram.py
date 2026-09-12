"""Render the Vinhomes current-state workflow diagram as a PNG."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "04-workflow-diagram.png"

WIDTH, HEIGHT = 2000, 1200
BG = "#F5F7FA"
NAVY = "#102A43"
BLUE = "#1769AA"
LIGHT_BLUE = "#EAF3FA"
GOLD = "#C8912E"
LIGHT_GOLD = "#FFF6DF"
RED = "#C0392B"
LIGHT_RED = "#FDECEA"
GRAY = "#52606D"
WHITE = "#FFFFFF"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "arialbd.ttf" if bold else "arial.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)


TITLE = font(54, True)
SUBTITLE = font(28)
STEP = font(25, True)
BODY = font(23)
SMALL = font(20)
BADGE = font(19, True)
FOOT = font(22)


def wrap(draw: ImageDraw.ImageDraw, text: str, max_width: int, text_font: ImageFont.FreeTypeFont) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=text_font)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], color: str = BLUE) -> None:
    draw.line([start, end], fill=color, width=8)
    x2, y2 = end
    x1, y1 = start
    if abs(x2 - x1) >= abs(y2 - y1):
        direction = 1 if x2 > x1 else -1
        points = [(x2, y2), (x2 - 22 * direction, y2 - 14), (x2 - 22 * direction, y2 + 14)]
    else:
        direction = 1 if y2 > y1 else -1
        points = [(x2, y2), (x2 - 14, y2 - 22 * direction), (x2 + 14, y2 - 22 * direction)]
    draw.polygon(points, fill=color)


def badge(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fill: str, fg: str = WHITE) -> None:
    box = draw.textbbox((0, 0), text, font=BADGE)
    w = box[2] - box[0] + 28
    h = box[3] - box[1] + 18
    draw.rounded_rectangle((x, y, x + w, y + h), radius=12, fill=fill)
    draw.text((x + 14, y + 7), text, fill=fg, font=BADGE)


def node(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    step_no: int,
    title: str,
    actor: str,
    duration: str,
    bottleneck: bool = False,
) -> None:
    x1, y1, x2, y2 = xy
    border = RED if bottleneck else BLUE
    fill = LIGHT_RED if bottleneck else WHITE
    draw.rounded_rectangle(xy, radius=24, fill=fill, outline=border, width=6)
    draw.rounded_rectangle((x1, y1, x2, y1 + 55), radius=22, fill=border)
    draw.rectangle((x1, y1 + 30, x2, y1 + 55), fill=border)
    draw.text((x1 + 22, y1 + 13), f"BƯỚC {step_no}", fill=WHITE, font=STEP)
    if bottleneck:
        badge(draw, x2 - 176, y1 + 9, "BOTTLENECK", GOLD)

    title_lines = wrap(draw, title, x2 - x1 - 44, STEP)
    y = y1 + 76
    for line in title_lines[:3]:
        draw.text((x1 + 22, y), line, fill=NAVY, font=STEP)
        y += 32

    actor_lines = wrap(draw, f"Actor: {actor}", x2 - x1 - 44, BODY)
    y = max(y + 8, y2 - 82)
    for line in actor_lines[:2]:
        draw.text((x1 + 22, y), line, fill=GRAY, font=BODY)
        y += 27
    draw.text((x1 + 22, y2 - 38), f"Thời gian: {duration}", fill=RED if bottleneck else BLUE, font=SMALL)


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, WIDTH, 145), fill=NAVY)
    draw.text((70, 32), "CURRENT-STATE WORKFLOW", fill=WHITE, font=TITLE)
    draw.text((70, 96), "Khách hàng tìm và nhận tư vấn căn hộ Vinhomes", fill="#D9EAF7", font=SUBTITLE)

    boxes = {
        1: (70, 205, 570, 455),
        2: (750, 205, 1250, 455),
        3: (1430, 205, 1930, 455),
        4: (1430, 610, 1930, 860),
        5: (750, 610, 1250, 860),
        6: (70, 610, 570, 860),
    }

    node(draw, boxes[1], 1, "Tìm thông tin trên nhiều nguồn", "Khách hàng", "15–30 phút*")
    node(draw, boxes[2], 2, "Gửi nhu cầu cho nhân viên", "Khách hàng", "2–5 phút")
    node(draw, boxes[3], 3, "Hỏi lại và chuẩn hóa nhu cầu", "Nhân viên kinh doanh", "5–10 phút")
    node(draw, boxes[4], 4, "Tra cứu và lọc giỏ hàng", "Nhân viên kinh doanh", "10–20 phút*", True)
    node(draw, boxes[5], 5, "So sánh căn và phương án tài chính", "Nhân viên kinh doanh", "10–15 phút*")
    node(draw, boxes[6], 6, "Gửi danh sách và nhận phản hồi", "Khách hàng + nhân viên", "5–10 phút")

    arrow(draw, (570, 330), (750, 330))
    arrow(draw, (1250, 330), (1430, 330), GOLD)
    badge(draw, 1281, 273, "HANDOFF", GOLD)
    draw.text((1278, 352), "Khách → Sales", fill=GOLD, font=SMALL)

    arrow(draw, (1680, 455), (1680, 610))
    arrow(draw, (1430, 735), (1250, 735))
    arrow(draw, (750, 735), (570, 735), GOLD)
    badge(draw, 590, 678, "HANDOFF", GOLD)
    draw.text((588, 757), "Sales → Khách", fill=GOLD, font=SMALL)

    draw.rounded_rectangle((70, 930, 1930, 1105), radius=24, fill=LIGHT_GOLD, outline=GOLD, width=3)
    draw.text((105, 960), "TỔNG THỜI GIAN ƯỚC TÍNH: 47–90 PHÚT/LƯỢT", fill=NAVY, font=STEP)
    draw.text((105, 1005), "Bottleneck: chuyển nhu cầu thành tiêu chí và lọc căn còn hiệu lực.", fill=RED, font=FOOT)
    draw.text((105, 1045), "* Thời gian là giả định ban đầu; cần bấm giờ với quy trình thật để xác lập baseline.", fill=GRAY, font=FOOT)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, format="PNG", optimize=True)
    print(f"Rendered: {OUTPUT}")


if __name__ == "__main__":
    main()
