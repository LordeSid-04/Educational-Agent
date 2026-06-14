import asyncio, os, base64
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv('/app/backend/.env')
KEY = os.getenv('EMERGENT_LLM_KEY')
OUT = '/app/frontend/public/assets'

with open(f'{OUT}/hero-subway.jpg', 'rb') as f:
    ref = base64.b64encode(f.read()).decode('utf-8')

PROMPTS = {
  'hero-hd': (
    "Recreate and upscale this scene as an ultra high-resolution, crystal-clear cinematic 3D "
    "animated movie still in the style of Spider-Man: Into the Spider-Verse. Keep the same young "
    "man with shaggy hair, large over-ear headphones and a green hoodie, sitting alone inside a "
    "gritty moody New York City subway train car at night. Now he is looking down at a GLOWING OPEN "
    "LAPTOP resting on his lap, soft cyan screen light reflecting on his face and hoodie. Detailed "
    "brushed-metal interior, chrome poles, empty blue seats, ad frames. Through the windows, vibrant "
    "neon graffiti glows magenta, cyan and orange. Warm incandescent ceiling lights mixed with cool "
    "blue shadows, volumetric god-rays, shallow depth of field. Wide cinematic 16:9 composition, "
    "the character on the right third. Razor sharp, ultra detailed, clean render, no noise, no grain, "
    "professional film color grade."
  ),
  'subway-env': (
    "Ultra high-resolution crystal-clear cinematic 3D animated movie still, Spider-Man Into the "
    "Spider-Verse style. An EMPTY moody New York City subway train car interior at night, deep "
    "perspective down the aisle: chrome grab poles, rows of empty blue seats, brushed metal walls, "
    "ad frames, fluorescent ceiling strip lights with a couple flickering. Through the windows, "
    "glowing neon graffiti in magenta and cyan streaks past. Cinematic wide 16:9 framing, volumetric "
    "haze, warm-cool lighting contrast, razor sharp, ultra detailed, clean render, no grain."
  ),
}

async def gen(name, prompt, use_ref):
    chat = LlmChat(api_key=KEY, session_id=f'cm-{name}', system_message="You are an expert concept artist.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    msg = UserMessage(text=prompt, file_contents=[ImageContent(ref)] if use_ref else None)
    _, images = await chat.send_message_multimodal_response(msg)
    if images:
        data = base64.b64decode(images[0]['data'])
        path = f'{OUT}/{name}.png'
        with open(path, 'wb') as f:
            f.write(data)
        print(f'OK {name} -> {len(data)} bytes')
    else:
        print(f'NO IMAGE for {name}')

async def main():
    await asyncio.gather(
        gen('hero-hd', PROMPTS['hero-hd'], True),
        gen('subway-env', PROMPTS['subway-env'], False),
    )

asyncio.run(main())
