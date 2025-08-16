from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return JSONResponse({"message": "Next.js app is running on frontend service", "redirect": "http://localhost:3000"})

@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "message": "Backend placeholder - Next.js app is on port 3000"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)