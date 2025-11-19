"""System configuration API endpoints."""

import io
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS
from app.shared.responses import SuccessResponse
from .dependencies import get_system_config_service
from .service import SystemConfigurationService
from .schemas import (
    GeneralSettingsUpdate, AppSettingsUpdate, MaintenanceSettings, NotificationPreferences,
    EmailSettings, SmsSettings, SecurityPolicies, BackupSettings, FeatureToggle,
    SystemSettings, SystemHealth, FeatureTogglesList, BackupsList, BackupListItem,
    BackupRequest, FeatureToggleUpdate
)

router = APIRouter(prefix="/system-config", tags=[API_TAGS.SYSTEM_CONFIGURATION])


@router.get("/settings", response_model=SuccessResponse[SystemSettings])
async def get_system_settings(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SystemSettings]:
    """
    Get complete system configuration settings.
    
    Returns all system settings including general, application, maintenance,
    notifications, email, SMS, security, and backup configurations.
    """
    settings = service.get_system_settings()
    
    return SuccessResponse(
        data=settings,
        message="System settings retrieved successfully"
    )


@router.put("/settings/general", response_model=SuccessResponse[SystemSettings])
async def update_general_settings(
    settings_update: GeneralSettingsUpdate,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SystemSettings]:
    """
    Update general system settings.
    
    Updates platform name, description, default language, currency, timezone,
    contact information, business hours, and file upload limits.
    """
    updated_settings = service.update_general_settings(settings_update)
    
    return SuccessResponse(
        data=updated_settings,
        message="General settings updated successfully"
    )


@router.put("/settings/app", response_model=SuccessResponse[SystemSettings])
async def update_app_settings(
    settings_update: AppSettingsUpdate,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SystemSettings]:
    """
    Update application-specific settings.
    
    Updates booking policies, commission rates, verification requirements,
    moderation settings, and feature-specific configurations.
    """
    updated_settings = service.update_app_settings(settings_update)
    
    return SuccessResponse(
        data=updated_settings,
        message="Application settings updated successfully"
    )


@router.get("/maintenance", response_model=SuccessResponse[MaintenanceSettings])
async def get_maintenance_settings(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[MaintenanceSettings]:
    """
    Get current maintenance mode settings.
    
    Returns maintenance mode status, scheduled maintenance windows,
    affected services, and access permissions.
    """
    settings = service.get_maintenance_settings()
    
    return SuccessResponse(
        data=settings,
        message="Maintenance settings retrieved successfully"
    )


@router.put("/maintenance", response_model=SuccessResponse[MaintenanceSettings])
async def update_maintenance_settings(
    settings: MaintenanceSettings,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[MaintenanceSettings]:
    """
    Update maintenance mode settings.
    
    Configure maintenance mode, schedule maintenance windows,
    set maintenance messages, and control admin access during maintenance.
    """
    updated_settings = service.update_maintenance_settings(settings)
    
    return SuccessResponse(
        data=updated_settings,
        message="Maintenance settings updated successfully"
    )


@router.get("/notifications", response_model=SuccessResponse[NotificationPreferences])
async def get_notification_preferences(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[NotificationPreferences]:
    """
    Get notification preferences for different events.
    
    Returns configured notification channels for various system events
    like user registration, bookings, payments, disputes, and alerts.
    """
    preferences = service.get_notification_preferences()
    
    return SuccessResponse(
        data=preferences,
        message="Notification preferences retrieved successfully"
    )


@router.put("/notifications", response_model=SuccessResponse[NotificationPreferences])
async def update_notification_preferences(
    preferences: NotificationPreferences,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[NotificationPreferences]:
    """
    Update notification preferences.
    
    Configure which notification channels (email, SMS, push, in-app)
    should be used for different types of system events.
    """
    updated_preferences = service.update_notification_preferences(preferences)
    
    return SuccessResponse(
        data=updated_preferences,
        message="Notification preferences updated successfully"
    )


@router.get("/email", response_model=SuccessResponse[EmailSettings])
async def get_email_settings(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[EmailSettings]:
    """
    Get email configuration settings.
    
    Returns SMTP configuration, sender settings, and email preferences.
    Sensitive data like passwords are redacted in the response.
    """
    settings = service.get_email_settings()
    
    return SuccessResponse(
        data=settings,
        message="Email settings retrieved successfully"
    )


@router.put("/email", response_model=SuccessResponse[EmailSettings])
async def update_email_settings(
    settings: EmailSettings,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[EmailSettings]:
    """
    Update email configuration settings.
    
    Configure SMTP server, authentication, encryption, sender information,
    and email delivery preferences.
    """
    updated_settings = service.update_email_settings(settings)
    
    return SuccessResponse(
        data=updated_settings,
        message="Email settings updated successfully"
    )


@router.get("/sms", response_model=SuccessResponse[SmsSettings])
async def get_sms_settings(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SmsSettings]:
    """
    Get SMS configuration settings.
    
    Returns SMS provider configuration, API credentials, sender ID,
    and default country settings. Sensitive data is redacted.
    """
    settings = service.get_sms_settings()
    
    return SuccessResponse(
        data=settings,
        message="SMS settings retrieved successfully"
    )


@router.put("/sms", response_model=SuccessResponse[SmsSettings])
async def update_sms_settings(
    settings: SmsSettings,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SmsSettings]:
    """
    Update SMS configuration settings.
    
    Configure SMS provider, API credentials, sender ID,
    and default country code for SMS delivery.
    """
    updated_settings = service.update_sms_settings(settings)
    
    return SuccessResponse(
        data=updated_settings,
        message="SMS settings updated successfully"
    )


@router.get("/security", response_model=SuccessResponse[SecurityPolicies])
async def get_security_policies(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SecurityPolicies]:
    """
    Get security policies and configurations.
    
    Returns password requirements, session settings, login restrictions,
    two-factor authentication settings, IP whitelists, and security level.
    """
    policies = service.get_security_policies()
    
    return SuccessResponse(
        data=policies,
        message="Security policies retrieved successfully"
    )


@router.put("/security", response_model=SuccessResponse[SecurityPolicies])
async def update_security_policies(
    policies: SecurityPolicies,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SecurityPolicies]:
    """
    Update security policies and configurations.
    
    Configure password requirements, session timeouts, login restrictions,
    two-factor authentication, IP restrictions, and overall security level.
    """
    updated_policies = service.update_security_policies(policies)
    
    return SuccessResponse(
        data=updated_policies,
        message="Security policies updated successfully"
    )


@router.get("/health", response_model=SuccessResponse[SystemHealth])
async def get_system_health(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[SystemHealth]:
    """
    Get system health and status information.
    
    Returns status of databases, external services, resource usage,
    active user count, and last health check timestamp.
    """
    health = service.get_system_health()
    
    return SuccessResponse(
        data=health,
        message="System health status retrieved successfully"
    )


@router.get("/features", response_model=SuccessResponse[FeatureTogglesList])
async def get_feature_toggles(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[FeatureTogglesList]:
    """
    Get all feature toggles and their current status.
    
    Returns list of feature toggles with their status, rollout percentage,
    target user types, and scheduling information.
    """
    features = service.get_feature_toggles()
    
    return SuccessResponse(
        data=features,
        message="Feature toggles retrieved successfully"
    )


@router.put("/features/{feature_key}", response_model=SuccessResponse[FeatureToggle])
async def update_feature_toggle(
    feature_key: str,
    update: FeatureToggleUpdate,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[FeatureToggle]:
    """
    Update a specific feature toggle.
    
    Modify feature status, rollout percentage, target user types,
    and scheduling for a specific feature.
    """
    if not feature_key.strip():
        raise HTTPException(status_code=HTTP_STATUS_CODES.BAD_REQUEST, detail=ERROR_MESSAGES.FEATURE_KEY_EMPTY)
    
    updated_feature = service.update_feature_toggle(feature_key, update)
    
    return SuccessResponse(
        data=updated_feature,
        message=f"Feature toggle '{feature_key}' updated successfully"
    )


@router.get("/backups", response_model=SuccessResponse[BackupsList])
async def get_backups(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[BackupsList]:
    """
    Get list of system backups.
    
    Returns backup history with creation dates, sizes, types, status,
    retention information, and summary statistics.
    """
    backups = service.get_backups()
    
    return SuccessResponse(
        data=backups,
        message="Backup list retrieved successfully"
    )


@router.post("/backups", response_model=SuccessResponse[BackupListItem])
async def create_backup(
    backup_request: BackupRequest,
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> SuccessResponse[BackupListItem]:
    """
    Create a new system backup.
    
    Initiate a backup process with specified type (full/incremental),
    media inclusion, and optional description.
    """
    backup = service.create_backup(backup_request)
    
    return SuccessResponse(
        data=backup,
        message="Backup creation initiated successfully"
    )


@router.get("/export")
async def export_system_configuration(
    service: Annotated[SystemConfigurationService, Depends(get_system_config_service)]
) -> StreamingResponse:
    """
    Export system configuration to Excel file.
    
    Generates a comprehensive Excel report containing all system settings,
    configurations, and current status for backup or audit purposes.
    """
    file_content = service.export_system_settings()
    
    headers = {
        "Content-Disposition": f"attachment; filename=system_config_export_{int(datetime.utcnow().timestamp())}.txt"
    }
    
    return StreamingResponse(
        io.BytesIO(file_content.getvalue()),
        media_type="text/plain",
        headers=headers
    )