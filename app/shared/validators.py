"""
Custom validators for Pydantic models.
Reusable validation logic for common patterns.
"""

import re
from typing import Any
from pydantic import field_validator


def validate_email(email: str) -> str:
    """
    Validate email format.

    Args:
        email: Email address to validate

    Returns:
        Lowercase email

    Raises:
        ValueError: If email format is invalid
    """
    email = email.lower().strip()
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(pattern, email):
        raise ValueError('Invalid email format')

    return email


def validate_password(password: str) -> str:
    """
    Validate password strength.

    Requirements:
    - At least 8 characters
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit

    Args:
        password: Password to validate

    Returns:
        Password

    Raises:
        ValueError: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise ValueError('Password must be at least 8 characters long')

    if not re.search(r'[A-Z]', password):
        raise ValueError('Password must contain at least one uppercase letter')

    if not re.search(r'[a-z]', password):
        raise ValueError('Password must contain at least one lowercase letter')

    if not re.search(r'\d', password):
        raise ValueError('Password must contain at least one digit')

    return password


def validate_username(username: str) -> str:
    """
    Validate username format.

    Requirements:
    - 3-50 characters
    - Only alphanumeric, underscores, and hyphens
    - Cannot start or end with underscore or hyphen

    Args:
        username: Username to validate

    Returns:
        Lowercase username

    Raises:
        ValueError: If username format is invalid
    """
    username = username.lower().strip()

    if len(username) < 3 or len(username) > 50:
        raise ValueError('Username must be between 3 and 50 characters')

    if not re.match(r'^[a-z0-9][a-z0-9_-]*[a-z0-9]$', username):
        raise ValueError(
            'Username must contain only letters, numbers, underscores, and hyphens. '
            'Cannot start or end with underscore or hyphen.'
        )

    return username


def validate_phone(phone: str) -> str:
    """
    Validate phone number format.

    Accepts various formats:
    - +1234567890
    - +1-234-567-8900
    - (123) 456-7890

    Args:
        phone: Phone number to validate

    Returns:
        Cleaned phone number

    Raises:
        ValueError: If phone format is invalid
    """
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)

    if not re.match(r'^\+?\d{10,15}$', cleaned):
        raise ValueError('Invalid phone number format')

    return cleaned


def validate_url(url: str) -> str:
    """
    Validate URL format.

    Args:
        url: URL to validate

    Returns:
        URL

    Raises:
        ValueError: If URL format is invalid
    """
    pattern = r'^https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)$'

    if not re.match(pattern, url):
        raise ValueError('Invalid URL format')

    return url


def validate_slug(slug: str) -> str:
    """
    Validate slug format.

    Requirements:
    - Lowercase alphanumeric and hyphens only
    - Cannot start or end with hyphen

    Args:
        slug: Slug to validate

    Returns:
        Slug

    Raises:
        ValueError: If slug format is invalid
    """
    slug = slug.lower().strip()

    if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', slug):
        raise ValueError(
            'Slug must contain only lowercase letters, numbers, and hyphens. '
            'Cannot start or end with hyphen.'
        )

    return slug
