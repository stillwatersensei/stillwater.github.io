Stillwater v17 Sage Sprite System

The v17 app supports one sprite folder per stage:

awakening-breath
lift-flow
flowing-arms
gather-qi
stillness
closing
final-bow

Each folder should contain frame-01.png, frame-02.png, etc.
The current app.js stage settings define the expected frameCount and frameSpeed.

Behavior:
- Music continues steadily across stages.
- Voice starts at the beginning of each stage.
- Sage sprite animation starts at the same time as the voice.
- When the voice ends, Sage returns to the still stage image.
- Missing sprite frames are handled safely with fallback still images.
