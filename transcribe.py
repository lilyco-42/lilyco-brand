from faster_whisper import WhisperModel

OUT = r"C:/Users/liuqi/WorkBuddy/2026-09-24-16-58-21/openai_brand_asr.txt"
AUDIO = r"C:/Users/liuqi/WorkBuddy/2026-09-24-16-58-21/openai_brand_audio.wav"

print("loading model small (int8, cpu) ...")
model = WhisperModel(model_size_or_path="small", device="cpu", compute_type="int8")
print("transcribing ...")
segs, info = model.transcribe(
    AUDIO, language="zh", beam_size=5, vad_filter=True,
    condition_on_previous_text=True,
)
with open(OUT, "w", encoding="utf-8") as f:
    for s in segs:
        line = f"[{s.start:6.1f}-{s.end:6.1f}] {s.text.strip()}\n"
        f.write(line)
        print(line, end="")
print("DONE ->", OUT)
