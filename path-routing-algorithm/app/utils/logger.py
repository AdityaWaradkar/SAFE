"""
Logging Utility
"""

from loguru import logger
import sys
import os

# Remove default handler
logger.remove()

# Console handler
logger.add(
    sys.stdout,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - <level>{message}</level>",
    level=os.getenv("LOG_LEVEL", "INFO").upper()
)

# File handler
logger.add(
    "logs/algorithm.log",
    rotation="10 MB",
    retention="7 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name} - {message}",
    level=os.getenv("LOG_LEVEL", "INFO").upper()
)

def get_logger(name: str):
    """Get a logger instance with the given name"""
    return logger.bind(name=name)