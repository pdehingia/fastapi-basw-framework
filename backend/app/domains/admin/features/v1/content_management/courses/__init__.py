"""
Course Management Module for Admin Domain

This module provides comprehensive course catalog management capabilities including:
- Master course catalog CRUD operations
- Course categories and levels management
- Academy course offerings and associations
- Course availability and enrollment controls
- Course pricing and schedule management
"""

from .api import router

__all__ = ["router"]
