"""Utilities for extracting client information from HTTP requests."""

import re
import requests
from typing import Dict, Optional
from fastapi import Request
from user_agents import parse


def get_client_ip(request: Request) -> str:
    """
    Extract the real client IP address from the request.
    Handles X-Forwarded-For, X-Real-IP, and direct connection scenarios.
    """
    # Check for forwarded IP (common with reverse proxies like nginx)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, first one is the client
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header (some proxy setups)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Check for standard forwarded header
    forwarded = request.headers.get("X-Forwarded")
    if forwarded:
        return forwarded
    
    # Fall back to client host (direct connection)
    if hasattr(request.client, "host"):
        return request.client.host
    
    return "unknown"


def get_user_agent_info(request: Request) -> Dict[str, str]:
    """
    Parse user agent string to extract browser, OS, and device information.
    """
    user_agent_string = request.headers.get("User-Agent", "")
    user_agent = parse(user_agent_string)
    
    return {
        "user_agent": user_agent_string,
        "browser": f"{user_agent.browser.family} {user_agent.browser.version_string}",
        "os": f"{user_agent.os.family} {user_agent.os.version_string}",
        "device": user_agent.device.family,
        "is_mobile": user_agent.is_mobile,
        "is_tablet": user_agent.is_tablet,
        "is_pc": user_agent.is_pc,
        "is_bot": user_agent.is_bot
    }


def get_location_from_ip(ip_address: str) -> Dict[str, Optional[str]]:
    """
    Get location information from IP address using a geolocation service.
    Returns country, region, city, and timezone information.
    """
    # Skip location lookup for local/private IPs
    if is_private_ip(ip_address):
        return {
            "country": "Local",
            "region": "Local",
            "city": "Local", 
            "timezone": "Local",
            "latitude": None,
            "longitude": None
        }
    
    try:
        # Using ipapi.co (free service, no API key needed for basic info)
        response = requests.get(
            f"https://ipapi.co/{ip_address}/json/",
            timeout=3  # Quick timeout to not slow down auth
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                "country": data.get("country_name"),
                "region": data.get("region"),
                "city": data.get("city"),
                "timezone": data.get("timezone"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude")
            }
    except Exception as e:
        # Log error but don't fail authentication
        print(f"Location lookup error for IP {ip_address}: {e}")
    
    return {
        "country": "Unknown",
        "region": "Unknown", 
        "city": "Unknown",
        "timezone": "Unknown",
        "latitude": None,
        "longitude": None
    }


def is_private_ip(ip: str) -> bool:
    """Check if an IP address is private/local."""
    if ip in ["unknown", "localhost", "127.0.0.1", "::1"]:
        return True
    
    # Check for private IP ranges
    private_patterns = [
        r"^127\.",          # 127.x.x.x (loopback)
        r"^10\.",           # 10.x.x.x (class A private)
        r"^172\.(1[6-9]|2[0-9]|3[0-1])\.",  # 172.16.x.x - 172.31.x.x (class B private)
        r"^192\.168\.",     # 192.168.x.x (class C private)
        r"^169\.254\.",     # 169.254.x.x (link-local)
        r"^fc00:",          # fc00::/7 (IPv6 private)
        r"^fe80:",          # fe80::/10 (IPv6 link-local)
    ]
    
    return any(re.match(pattern, ip) for pattern in private_patterns)


def get_comprehensive_client_info(request: Request) -> Dict[str, any]:
    """
    Get comprehensive client information including IP, user agent, device, and location.
    """
    ip_address = get_client_ip(request)
    user_agent_info = get_user_agent_info(request)
    location_info = get_location_from_ip(ip_address)
    
    return {
        "ip_address": ip_address,
        "user_agent": user_agent_info["user_agent"],
        "browser": user_agent_info["browser"],
        "operating_system": user_agent_info["os"],
        "device_type": user_agent_info["device"],
        "is_mobile": user_agent_info["is_mobile"],
        "is_tablet": user_agent_info["is_tablet"],
        "is_pc": user_agent_info["is_pc"],
        "is_bot": user_agent_info["is_bot"],
        "country": location_info["country"],
        "region": location_info["region"],
        "city": location_info["city"],
        "timezone": location_info["timezone"],
        "latitude": location_info["latitude"],
        "longitude": location_info["longitude"]
    }