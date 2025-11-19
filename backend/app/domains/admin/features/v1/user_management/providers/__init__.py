"""
Provider Management Module for Admin Domain

Unified provider management including:
- Core provider CRUD and verification
- Salon provider employment relationships  
- Provider business details and approval workflow
- Salon ownership management

All provider-related admin operations consolidated in one domain module.
"""

from .api import provider_management_router

__all__ = ["provider_management_router"]