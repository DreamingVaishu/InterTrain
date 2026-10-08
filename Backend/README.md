# InterTrain Backend

Simple FastAPI backend for the InterTrain interview app.

## Services

- OpenRouter: interview questions, coding problem generation, code review and final interview evaluation.
- Deepgram: speech-to-text and text-to-speech.
- Wandbox: code execution and test results for the final coding round.

## Environment

Copy `.env.example` to `.env`:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-oss-120b
DEEPGRAM_API_KEY=your_deepgram_key

WANDBOX_URL=https://wandbox.org/api
```


## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Interview flow

1. Round 1 asks for an introduction based on the selected subject.
2. Rounds 2-4 use the previous question and answer to create the next question.
3. Round 5 generates a practical coding problem based on the subject and interview history.
4. The frontend automatically opens the Monaco code editor.
5. Code is executed against the generated test cases using Wandbox.
6. OpenRouter reviews the code and real execution results.
7. The complete interview and coding review are sent to OpenRouter for the final result.
