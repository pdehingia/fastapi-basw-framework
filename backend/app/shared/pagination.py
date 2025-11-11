"""
Pagination utilities for handling large datasets.
Provides cursor-based and offset-based pagination.
"""

from typing import TypeVar, Generic, List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Query
from math import ceil

T = TypeVar('T')


class PaginationParams(BaseModel):
    """
    Pagination parameters for API requests.

    Attributes:
        page: Current page number (1-indexed)
        page_size: Number of items per page
    """

    page: int = Field(default=1, ge=1, description="Page number (starting from 1)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        """Calculate SQL offset from page and page_size."""
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        """Get limit (alias for page_size)."""
        return self.page_size


class PageMetadata(BaseModel):
    """Metadata about pagination."""

    page: int = Field(description="Current page number")
    page_size: int = Field(description="Items per page")
    total_items: int = Field(description="Total number of items")
    total_pages: int = Field(description="Total number of pages")
    has_next: bool = Field(description="Whether there is a next page")
    has_previous: bool = Field(description="Whether there is a previous page")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response model.

    Attributes:
        items: List of items for current page
        metadata: Pagination metadata
    """

    items: List[T] = Field(description="List of items")
    metadata: PageMetadata = Field(description="Pagination metadata")


def paginate(
    query: Query,
    params: PaginationParams,
    schema: type[T]
) -> PaginatedResponse[T]:
    """
    Paginate a SQLAlchemy query.

    Args:
        query: SQLAlchemy query to paginate
        params: Pagination parameters
        schema: Pydantic schema to convert items to

    Returns:
        PaginatedResponse with items and metadata

    Example:
        query = db.query(User).filter(User.is_active == True)
        result = paginate(query, PaginationParams(page=1, page_size=20), UserResponse)
    """
    # Get total count
    total_items = query.count()

    # Calculate total pages
    total_pages = ceil(total_items / params.page_size) if total_items > 0 else 0

    # Get items for current page
    items = query.offset(params.offset).limit(params.page_size).all()

    # Convert to schema
    converted_items = [
        schema.model_validate(item) if hasattr(schema, 'model_validate')
        else schema.from_orm(item)
        for item in items
    ]

    # Create metadata
    metadata = PageMetadata(
        page=params.page,
        page_size=params.page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=params.page < total_pages,
        has_previous=params.page > 1
    )

    return PaginatedResponse(items=converted_items, metadata=metadata)


class CursorPaginationParams(BaseModel):
    """
    Cursor-based pagination parameters.
    Better for large datasets and real-time data.

    Attributes:
        cursor: Cursor for next page (ID of last item)
        limit: Number of items to return
    """

    cursor: Optional[int] = Field(default=None, description="Cursor (ID) for pagination")
    limit: int = Field(default=20, ge=1, le=100, description="Number of items")


class CursorPaginatedResponse(BaseModel, Generic[T]):
    """
    Cursor-based paginated response.

    Attributes:
        items: List of items
        next_cursor: Cursor for next page (None if no more items)
        has_more: Whether there are more items
    """

    items: List[T] = Field(description="List of items")
    next_cursor: Optional[int] = Field(description="Cursor for next page")
    has_more: bool = Field(description="Whether there are more items")


def paginate_cursor(
    query: Query,
    params: CursorPaginationParams,
    schema: type[T],
    id_column: str = "id"
) -> CursorPaginatedResponse[T]:
    """
    Paginate using cursor-based pagination.

    Args:
        query: SQLAlchemy query to paginate
        params: Cursor pagination parameters
        schema: Pydantic schema to convert items to
        id_column: Name of the ID column for cursor

    Returns:
        CursorPaginatedResponse with items and next cursor

    Example:
        query = db.query(User).filter(User.is_active == True).order_by(User.id)
        result = paginate_cursor(query, CursorPaginationParams(cursor=100, limit=20), UserResponse)
    """
    # Apply cursor filter if provided
    if params.cursor:
        query = query.filter(getattr(query.column_descriptions[0]['type'], id_column) > params.cursor)

    # Fetch limit + 1 to check if there are more items
    items = query.limit(params.limit + 1).all()

    # Check if there are more items
    has_more = len(items) > params.limit

    # Remove extra item if present
    if has_more:
        items = items[:params.limit]

    # Convert to schema
    converted_items = [
        schema.model_validate(item) if hasattr(schema, 'model_validate')
        else schema.from_orm(item)
        for item in items
    ]

    # Get next cursor
    next_cursor = None
    if has_more and items:
        next_cursor = getattr(items[-1], id_column)

    return CursorPaginatedResponse(
        items=converted_items,
        next_cursor=next_cursor,
        has_more=has_more
    )
