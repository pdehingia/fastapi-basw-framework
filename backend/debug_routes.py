"""Debug script to list all available routes."""

from app.main import app

def list_all_routes():
    """List all available routes in the FastAPI app."""
    print("Available Routes in Maya Platform:")
    print("=" * 50)
    
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            print(f"{list(route.methods)[0]:8} {route.path}")
        elif hasattr(route, 'path'):
            print(f"{'MOUNT':8} {route.path}")
    
    print("=" * 50)

if __name__ == "__main__":
    list_all_routes()