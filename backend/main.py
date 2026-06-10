from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from api.routers.regions import router as regions_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting MentiSphere backend...")
    yield
    # Shutdown
    print("Shutting down MentiSphere backend...")

app = FastAPI(
    title="MentiSphere API",
    description="3D Brain Visualization Platform API",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(regions_router)

@app.get("/")
async def root():
    return {"message": "MentiSphere API", "version": "0.1.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
