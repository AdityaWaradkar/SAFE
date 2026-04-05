"""
Dynamic Risk-Aware Path Routing Algorithm
Main Entry Point
"""

import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()

if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 7000))
    HOST = os.getenv("HOST", "0.0.0.0")
    
    print("=" * 60)
    print("Dynamic Risk-Aware Path Routing Algorithm")
    print("=" * 60)
    print(f"Starting server on http://{HOST}:{PORT}")
    print("=" * 60)
    
    uvicorn.run(
        "app.server:app",
        host=HOST,
        port=PORT,
        reload=True
    )