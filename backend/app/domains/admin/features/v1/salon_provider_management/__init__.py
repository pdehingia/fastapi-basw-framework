"""
Salon Provider Relationships Module for Admin Domain

This module provides comprehensive management of provider-salon associations including:
- Adding and removing providers to/from salons
- Managing employment details and types
- Tracking provider performance metrics at salons
- Managing active/inactive employment status
- Revenue and booking analytics per provider-salon relationship
"""

from .api import router

__all__ = ["router"]
