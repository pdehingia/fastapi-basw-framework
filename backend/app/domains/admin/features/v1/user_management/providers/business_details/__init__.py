"""
Provider Business & Salon Ownership Module for Admin Domain

This module provides comprehensive management for:
- Provider business details (extended profiles)
- Business approval workflow
- Featured provider status management
- Provider-salon ownership relationships
- Salon ownership transfer
- Performance metrics and analytics
"""

from .api import router

__all__ = ["router"]
