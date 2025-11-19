"""Promotions & Marketing service layer."""

import io
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from .schemas import (
    PromoCodeCreate, PromoCodeUpdate, PromoCodeResponse, PromoCodeAnalytics,
    PromoCodeStatus, PromoCodeType,
    EmailCampaignCreate, EmailCampaignUpdate, EmailCampaignResponse,
    EmailCampaignStatus,
    EmailTemplateCreate, EmailTemplateUpdate, EmailTemplateResponse,
    SMSBroadcastRequest, SMSResponse, SMSStatus
)


class PromotionsMarketingService:
    """Service for managing promotions and marketing operations."""
    
    def __init__(self, db: Session, admin_id: str):
        self.db = db
        self.admin_id = admin_id
    
    # Promo Code Management
    def get_promo_codes(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[PromoCodeStatus] = None,
        type: Optional[PromoCodeType] = None,
        search: Optional[str] = None
    ) -> List[PromoCodeResponse]:
        """Get promo codes with filtering."""
        # Mock data - in real implementation, query from database
        mock_codes = [
            {
                "id": "promo_001",
                "code": "SAVE20",
                "name": "Save 20% Off",
                "description": "20% discount on all services",
                "type": PromoCodeType.PERCENTAGE,
                "value": 20.0,
                "minimum_order_value": 100.0,
                "maximum_discount": 50.0,
                "usage_limit": 1000,
                "user_usage_limit": 1,
                "valid_from": datetime(2024, 1, 1),
                "valid_until": datetime(2024, 12, 31),
                "applicable_services": ["bridal", "party"],
                "target_user_types": ["new_user"],
                "status": PromoCodeStatus.ACTIVE,
                "total_usage": 125,
                "revenue_generated": 5250.75,
                "created_at": datetime(2024, 1, 1),
                "updated_at": datetime(2024, 1, 1),
                "created_by": "admin_001"
            },
            {
                "id": "promo_002",
                "code": "FIRST50",
                "name": "First Time User Discount",
                "description": "₹50 off for first-time users",
                "type": PromoCodeType.FIXED_AMOUNT,
                "value": 50.0,
                "minimum_order_value": 200.0,
                "maximum_discount": None,
                "usage_limit": 500,
                "user_usage_limit": 1,
                "valid_from": datetime(2024, 2, 1),
                "valid_until": datetime(2024, 6, 30),
                "applicable_services": ["bridal", "party", "casual"],
                "target_user_types": ["first_time"],
                "status": PromoCodeStatus.EXPIRED,
                "total_usage": 350,
                "revenue_generated": 12500.0,
                "created_at": datetime(2024, 2, 1),
                "updated_at": datetime(2024, 6, 30),
                "created_by": "admin_002"
            },
            {
                "id": "promo_003",
                "code": "BRIDAL25",
                "name": "Bridal Special",
                "description": "25% off on bridal makeup services",
                "type": PromoCodeType.PERCENTAGE,
                "value": 25.0,
                "minimum_order_value": 300.0,
                "maximum_discount": 100.0,
                "usage_limit": 200,
                "user_usage_limit": 2,
                "valid_from": datetime(2024, 3, 1),
                "valid_until": datetime(2024, 12, 31),
                "applicable_services": ["bridal"],
                "target_user_types": ["all"],
                "status": PromoCodeStatus.ACTIVE,
                "total_usage": 89,
                "revenue_generated": 8945.25,
                "created_at": datetime(2024, 3, 1),
                "updated_at": datetime(2024, 3, 15),
                "created_by": "admin_001"
            }
        ]
        
        # Apply filters
        filtered_codes = mock_codes
        if status:
            filtered_codes = [code for code in filtered_codes if code["status"] == status]
        if type:
            filtered_codes = [code for code in filtered_codes if code["type"] == type]
        if search:
            filtered_codes = [
                code for code in filtered_codes 
                if search.lower() in code["code"].lower() or search.lower() in code["name"].lower()
            ]
        
        # Apply pagination
        paginated_codes = filtered_codes[skip:skip + limit]
        
        return [PromoCodeResponse(**code) for code in paginated_codes]
    
    def get_promo_code(self, promo_id: str) -> Optional[PromoCodeResponse]:
        """Get specific promo code."""
        codes = self.get_promo_codes()
        for code in codes:
            if code.id == promo_id:
                return code
        return None
    
    def create_promo_code(self, promo_data: PromoCodeCreate) -> PromoCodeResponse:
        """Create new promo code."""
        # Mock creation - in real implementation, save to database
        new_promo = PromoCodeResponse(
            id=f"promo_{len(self.get_promo_codes()) + 1:03d}",
            **promo_data.model_dump(),
            status=PromoCodeStatus.ACTIVE,
            total_usage=0,
            revenue_generated=0.0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            created_by=self.admin_id
        )
        return new_promo
    
    def update_promo_code(self, promo_id: str, promo_data: PromoCodeUpdate) -> Optional[PromoCodeResponse]:
        """Update promo code."""
        # Mock update - in real implementation, update database
        existing_promo = self.get_promo_code(promo_id)
        if not existing_promo:
            return None
        
        update_data = promo_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing_promo, field, value)
        
        existing_promo.updated_at = datetime.utcnow()
        return existing_promo
    
    def deactivate_promo_code(self, promo_id: str) -> bool:
        """Deactivate promo code."""
        # Mock deactivation - in real implementation, update database
        promo = self.get_promo_code(promo_id)
        if promo:
            promo.status = PromoCodeStatus.INACTIVE
            promo.updated_at = datetime.utcnow()
            return True
        return False
    
    def get_promo_code_analytics(self, promo_id: str) -> Optional[PromoCodeAnalytics]:
        """Get promo code analytics."""
        promo = self.get_promo_code(promo_id)
        if not promo:
            return None
        
        # Mock analytics data
        return PromoCodeAnalytics(
            id=promo.id,
            code=promo.code,
            name=promo.name,
            total_usage=promo.total_usage,
            unique_users=int(promo.total_usage * 0.8),  # Mock unique users
            revenue_generated=promo.revenue_generated,
            discount_given=promo.total_usage * promo.value,
            conversion_rate=15.5,  # Mock conversion rate
            daily_usage=[
                {"date": "2024-01-01", "usage": 5, "revenue": 250.0},
                {"date": "2024-01-02", "usage": 8, "revenue": 420.0},
                {"date": "2024-01-03", "usage": 12, "revenue": 630.0}
            ],
            top_users=[
                {"user_id": "user_001", "usage_count": 3, "total_savings": 150.0},
                {"user_id": "user_002", "usage_count": 2, "total_savings": 100.0}
            ]
        )
    
    # Email Campaign Management
    def get_email_campaigns(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[EmailCampaignStatus] = None,
        search: Optional[str] = None
    ) -> List[EmailCampaignResponse]:
        """Get email campaigns with filtering."""
        # Mock data - in real implementation, query from database
        mock_campaigns = [
            {
                "id": "email_001",
                "name": "New Year Promotion",
                "subject": "Start 2024 with Beautiful Makeup - 30% Off!",
                "sender_name": "Maya Beauty",
                "sender_email": "promotions@maya.beauty",
                "content": "<h1>New Year Special Offer</h1><p>Get 30% off on all services...</p>",
                "target_segments": ["all_users", "inactive_users"],
                "scheduled_at": datetime(2024, 1, 1, 10, 0),
                "status": EmailCampaignStatus.SENT,
                "recipients_count": 5000,
                "sent_count": 4995,
                "opened_count": 2250,
                "clicked_count": 450,
                "bounced_count": 5,
                "created_at": datetime(2023, 12, 25),
                "updated_at": datetime(2024, 1, 1, 11, 30),
                "created_by": "admin_001"
            },
            {
                "id": "email_002",
                "name": "Valentine's Day Campaign",
                "subject": "Look Stunning This Valentine's Day ❤️",
                "sender_name": "Maya Beauty",
                "sender_email": "valentine@maya.beauty",
                "content": "<h1>Valentine's Special</h1><p>Book your romantic look today...</p>",
                "target_segments": ["bridal_users", "party_users"],
                "scheduled_at": datetime(2024, 2, 10, 9, 0),
                "status": EmailCampaignStatus.SCHEDULED,
                "recipients_count": 2500,
                "sent_count": 0,
                "opened_count": 0,
                "clicked_count": 0,
                "bounced_count": 0,
                "created_at": datetime(2024, 1, 25),
                "updated_at": datetime(2024, 1, 25),
                "created_by": "admin_002"
            }
        ]
        
        # Apply filters
        filtered_campaigns = mock_campaigns
        if status:
            filtered_campaigns = [camp for camp in filtered_campaigns if camp["status"] == status]
        if search:
            filtered_campaigns = [
                camp for camp in filtered_campaigns 
                if search.lower() in camp["name"].lower() or search.lower() in camp["subject"].lower()
            ]
        
        # Apply pagination
        paginated_campaigns = filtered_campaigns[skip:skip + limit]
        
        return [EmailCampaignResponse(**campaign) for campaign in paginated_campaigns]
    
    def create_email_campaign(self, campaign_data: EmailCampaignCreate) -> EmailCampaignResponse:
        """Create new email campaign."""
        # Mock creation - in real implementation, save to database
        new_campaign = EmailCampaignResponse(
            id=f"email_{len(self.get_email_campaigns()) + 1:03d}",
            **campaign_data.model_dump(),
            status=EmailCampaignStatus.DRAFT,
            recipients_count=0,
            sent_count=0,
            opened_count=0,
            clicked_count=0,
            bounced_count=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            created_by=self.admin_id
        )
        return new_campaign
    
    def get_email_templates(
        self,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[EmailTemplateResponse]:
        """Get email templates."""
        # Mock data - in real implementation, query from database
        mock_templates = [
            {
                "id": "template_001",
                "name": "Welcome Email",
                "subject": "Welcome to Maya Beauty - Your Journey Begins!",
                "content": "<h1>Welcome {{name}}</h1><p>Thank you for joining Maya Beauty...</p>",
                "category": "welcome",
                "variables": ["name", "signup_date"],
                "usage_count": 1250,
                "created_at": datetime(2023, 6, 1),
                "updated_at": datetime(2023, 8, 15),
                "created_by": "admin_001"
            },
            {
                "id": "template_002",
                "name": "Booking Confirmation",
                "subject": "Your Booking is Confirmed - {{service_name}}",
                "content": "<h1>Booking Confirmed</h1><p>Dear {{customer_name}}, your booking for {{service_name}} is confirmed...</p>",
                "category": "booking",
                "variables": ["customer_name", "service_name", "booking_date", "artist_name"],
                "usage_count": 3450,
                "created_at": datetime(2023, 6, 1),
                "updated_at": datetime(2023, 9, 10),
                "created_by": "admin_001"
            },
            {
                "id": "template_003",
                "name": "Promotional Offer",
                "subject": "Special Offer Just for You - {{discount}}% Off!",
                "content": "<h1>Exclusive Offer</h1><p>Hi {{name}}, enjoy {{discount}}% off on your next booking...</p>",
                "category": "promotion",
                "variables": ["name", "discount", "valid_until"],
                "usage_count": 890,
                "created_at": datetime(2023, 7, 15),
                "updated_at": datetime(2023, 10, 5),
                "created_by": "admin_002"
            }
        ]
        
        # Apply filters
        filtered_templates = mock_templates
        if category:
            filtered_templates = [temp for temp in filtered_templates if temp["category"] == category]
        if search:
            filtered_templates = [
                temp for temp in filtered_templates 
                if search.lower() in temp["name"].lower() or search.lower() in temp["subject"].lower()
            ]
        
        # Apply pagination
        paginated_templates = filtered_templates[skip:skip + limit]
        
        return [EmailTemplateResponse(**template) for template in paginated_templates]
    
    def create_email_template(self, template_data: EmailTemplateCreate) -> EmailTemplateResponse:
        """Create email template."""
        # Mock creation - in real implementation, save to database
        new_template = EmailTemplateResponse(
            id=f"template_{len(self.get_email_templates()) + 1:03d}",
            **template_data.model_dump(),
            usage_count=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            created_by=self.admin_id
        )
        return new_template
    
    # SMS Management
    def get_sms_history(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[SMSStatus] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> List[SMSResponse]:
        """Get SMS broadcast history."""
        # Mock data - in real implementation, query from database
        mock_sms_history = [
            {
                "id": "sms_001",
                "message": "Flash Sale! 40% off on all makeup services. Book now at maya.beauty. Valid till midnight!",
                "sender_id": "MAYABEAUTY",
                "recipients_count": 2500,
                "sent_count": 2498,
                "delivered_count": 2450,
                "failed_count": 48,
                "status": SMSStatus.DELIVERED,
                "cost": 1249.0,
                "created_at": datetime(2024, 1, 15, 14, 30),
                "scheduled_at": None,
                "sent_at": datetime(2024, 1, 15, 14, 35),
                "created_by": "admin_001"
            },
            {
                "id": "sms_002",
                "message": "Your booking with Maya Beauty is confirmed for tomorrow 3 PM. Artist: Priya. Call 9876543210 for queries.",
                "sender_id": "MAYABEAUTY",
                "recipients_count": 150,
                "sent_count": 150,
                "delivered_count": 148,
                "failed_count": 2,
                "status": SMSStatus.DELIVERED,
                "cost": 75.0,
                "created_at": datetime(2024, 1, 20, 16, 0),
                "scheduled_at": None,
                "sent_at": datetime(2024, 1, 20, 16, 2),
                "created_by": "admin_002"
            }
        ]
        
        # Apply filters
        filtered_sms = mock_sms_history
        if status:
            filtered_sms = [sms for sms in filtered_sms if sms["status"] == status]
        if date_from:
            filtered_sms = [sms for sms in filtered_sms if sms["created_at"] >= date_from]
        if date_to:
            filtered_sms = [sms for sms in filtered_sms if sms["created_at"] <= date_to]
        
        # Apply pagination
        paginated_sms = filtered_sms[skip:skip + limit]
        
        return [SMSResponse(**sms) for sms in paginated_sms]
    
    def send_sms_broadcast(self, sms_data: SMSBroadcastRequest) -> SMSResponse:
        """Send SMS broadcast."""
        # Mock SMS sending - in real implementation, integrate with SMS service
        new_sms = SMSResponse(
            id=f"sms_{len(self.get_sms_history()) + 1:03d}",
            message=sms_data.message,
            sender_id=sms_data.sender_id,
            recipients_count=len(sms_data.target_segments) * 500,  # Mock recipient count
            sent_count=0,
            delivered_count=0,
            failed_count=0,
            status=SMSStatus.PENDING,
            cost=len(sms_data.target_segments) * 250.0,  # Mock cost calculation
            created_at=datetime.utcnow(),
            scheduled_at=sms_data.schedule_at,
            sent_at=None if sms_data.schedule_at else datetime.utcnow(),
            created_by=self.admin_id
        )
        return new_sms
    
    def export_promo_codes(
        self,
        status: Optional[PromoCodeStatus] = None,
        type: Optional[PromoCodeType] = None
    ) -> Tuple[io.BytesIO, str]:
        """Export promo codes to Excel."""
        try:
            import pandas as pd
            from datetime import datetime
            
            # Get promo codes data
            promo_codes = self.get_promo_codes(limit=1000, status=status, type=type)
            
            # Convert to DataFrame
            data = []
            for promo in promo_codes:
                data.append({
                    "Code": promo.code,
                    "Name": promo.name,
                    "Type": promo.type.value,
                    "Value": promo.value,
                    "Status": promo.status.value,
                    "Total Usage": promo.total_usage,
                    "Revenue Generated": f"₹{promo.revenue_generated:,.2f}",
                    "Valid From": promo.valid_from.strftime("%Y-%m-%d"),
                    "Valid Until": promo.valid_until.strftime("%Y-%m-%d"),
                    "Usage Limit": promo.usage_limit,
                    "Minimum Order": f"₹{promo.minimum_order_value:,.2f}" if promo.minimum_order_value else "No minimum",
                    "Created By": promo.created_by,
                    "Created Date": promo.created_at.strftime("%Y-%m-%d %H:%M")
                })
            
            df = pd.DataFrame(data)
            
            # Create Excel file
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Promo Codes', index=False)
                
                # Auto-adjust column widths
                worksheet = writer.sheets['Promo Codes']
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            output.seek(0)
            filename = f"promo_codes_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            return output, filename
            
        except ImportError:
            # Fallback: create a simple CSV if pandas is not available
            import csv
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                "Code", "Name", "Type", "Value", "Status", "Total Usage", 
                "Revenue Generated", "Valid From", "Valid Until", "Created By"
            ])
            
            # Write data
            promo_codes = self.get_promo_codes(limit=1000, status=status, type=type)
            for promo in promo_codes:
                writer.writerow([
                    promo.code, promo.name, promo.type.value, promo.value,
                    promo.status.value, promo.total_usage, promo.revenue_generated,
                    promo.valid_from.strftime("%Y-%m-%d"), promo.valid_until.strftime("%Y-%m-%d"),
                    promo.created_by
                ])
            
            # Convert to BytesIO
            csv_content = output.getvalue()
            bytes_output = io.BytesIO(csv_content.encode('utf-8'))
            filename = f"promo_codes_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            return bytes_output, filename