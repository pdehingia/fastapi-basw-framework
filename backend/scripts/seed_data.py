#!/usr/bin/env python3
"""
Maya Platform Data Seeding Script
=================================

This script seeds the database with realistic sample data for development and testing.
Includes users, bookings, payments, reviews, and all necessary reference data.

Usage:
    python scripts/seed_data.py
    python scripts/seed_data.py --reset  # Clear and reseed all data
"""

import asyncio
import sys
import os
import uuid
import random
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import bcrypt
from faker import Faker

from app.core.config import settings
from app.core.database import SessionLocal

# Initialize Faker for generating realistic data
fake = Faker()


class DataSeeder:
    """Main data seeding class"""
    
    def __init__(self, reset_data: bool = False):
        self.reset_data = reset_data
        self.engine = None
        self.session = None
        
        # Data containers
        self.roles = []
        self.permissions = []
        self.admin_users = []
        self.users = []
        self.categories = []
        self.bookings = []
        self.reviews = []
        self.providers = []
        
        print(f"🌱 Maya Platform Data Seeder")
        print(f"Reset mode: {'ON' if reset_data else 'OFF'}")
        print("-" * 50)
    
    async def setup_database(self):
        """Setup database connection"""
        try:
            # Create async engine
            database_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
            self.engine = create_async_engine(database_url, echo=False)
            
            # Create session factory
            AsyncSessionLocal = sessionmaker(
                self.engine, class_=AsyncSession, expire_on_commit=False
            )
            self.session = AsyncSessionLocal()
            
            print("✅ Database connection established")
            
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            sys.exit(1)
    
    async def clear_data(self):
        """Clear existing data if reset mode is enabled"""
        if not self.reset_data:
            return
            
        print("🔄 Clearing existing data...")
        
        # Clear tables in correct order (respecting foreign key constraints)
        tables_to_clear = [
            'user_sessions', 'otp_codes', 'chat_participants', 'messages',
            'booking_services', 'booking_timeline', 'bookings', 
            'user_reviews', 'payment_transactions', 'user_favorites',
            'user_addresses', 'user_profiles', 'artist_profiles',
            'provider_services', 'provider_availability', 'providers',
            'service_categories', 'users', 'role_permissions', 
            'admin_user_roles', 'admin_users', 'permissions', 'roles'
        ]
        
        for table in tables_to_clear:
            try:
                await self.session.execute(text(f"DELETE FROM {table}"))
                print(f"  Cleared {table}")
            except Exception as e:
                print(f"  Warning: Could not clear {table}: {e}")
        
        await self.session.commit()
        print("✅ Data clearing completed")
    
    async def seed_roles_and_permissions(self):
        """Seed roles and permissions"""
        print("🔐 Seeding roles and permissions...")
        
        # Define permissions
        permissions_data = [
            # User Management
            ('user.view', 'View users', 'user_management'),
            ('user.create', 'Create users', 'user_management'),
            ('user.edit', 'Edit users', 'user_management'),
            ('user.delete', 'Delete users', 'user_management'),
            
            # Booking Management
            ('booking.view', 'View bookings', 'booking_management'),
            ('booking.create', 'Create bookings', 'booking_management'),
            ('booking.edit', 'Edit bookings', 'booking_management'),
            ('booking.cancel', 'Cancel bookings', 'booking_management'),
            
            # Payment Management
            ('payment.view', 'View payments', 'payment_management'),
            ('payment.process', 'Process payments', 'payment_management'),
            ('payment.refund', 'Process refunds', 'payment_management'),
            
            # Admin Panel
            ('admin.dashboard', 'Access admin dashboard', 'admin_panel'),
            ('admin.analytics', 'View analytics', 'admin_panel'),
            ('admin.settings', 'Manage settings', 'admin_panel'),
            ('admin.support', 'Access support tools', 'admin_panel'),
        ]
        
        # Insert permissions
        for perm_slug, perm_name, category in permissions_data:
            await self.session.execute(text("""
                INSERT INTO permissions (permission_slug, permission_name, category, is_active)
                VALUES (:slug, :name, :category, true)
                ON CONFLICT (permission_slug) DO NOTHING
            """), {"slug": perm_slug, "name": perm_name, "category": category})
        
        # Define roles
        roles_data = [
            ('super_admin', 'Super Administrator', 'Full system access', 1),
            ('admin', 'Administrator', 'Admin panel access', 2),
            ('support_agent', 'Support Agent', 'Customer support access', 3),
            ('moderator', 'Content Moderator', 'Content moderation access', 4),
        ]
        
        # Insert roles
        for role_slug, role_name, description, level in roles_data:
            await self.session.execute(text("""
                INSERT INTO roles (role_slug, role_name, description, level, is_active)
                VALUES (:slug, :name, :description, :level, true)
                ON CONFLICT (role_slug) DO NOTHING
            """), {"slug": role_slug, "name": role_name, "description": description, "level": level})
        
        await self.session.commit()
        print("✅ Roles and permissions seeded")
    
    async def seed_admin_users(self):
        """Seed admin users"""
        print("👨‍💼 Seeding admin users...")
        
        # Hash password
        password = "admin123"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        admin_users_data = [
            {
                'email': 'admin@maya.com',
                'username': 'superadmin',
                'full_name': 'Super Administrator',
                'phone': '+1234567890',
                'department': 'IT Administration',
                'employee_id': 'EMP001',
                'is_superuser': True,
            },
            {
                'email': 'support@maya.com',
                'username': 'support_admin',
                'full_name': 'Support Administrator',
                'phone': '+1234567891',
                'department': 'Customer Support',
                'employee_id': 'EMP002',
                'is_superuser': False,
            },
            {
                'email': 'moderator@maya.com',
                'username': 'content_mod',
                'full_name': 'Content Moderator',
                'phone': '+1234567892',
                'department': 'Content Management',
                'employee_id': 'EMP003',
                'is_superuser': False,
            }
        ]
        
        for admin_data in admin_users_data:
            admin_data['hashed_password'] = hashed_password
            admin_data['is_active'] = True
            admin_data['is_verified'] = True
            admin_data['email_verified_at'] = datetime.utcnow()
            
            # Convert dict to SQL insert
            columns = ', '.join(admin_data.keys())
            placeholders = ', '.join([f':{key}' for key in admin_data.keys()])
            
            await self.session.execute(text(f"""
                INSERT INTO admin_users ({columns})
                VALUES ({placeholders})
                ON CONFLICT (email) DO NOTHING
            """), admin_data)
        
        await self.session.commit()
        print("✅ Admin users seeded")
    
    async def seed_service_categories(self):
        """Seed service categories"""
        print("🏷️ Seeding service categories...")
        
        categories_data = [
            {
                'name': 'Makeup',
                'slug': 'makeup',
                'description': 'Professional makeup services for all occasions',
                'icon': '💄',
                'is_active': True,
                'display_order': 1
            },
            {
                'name': 'Hair Styling',
                'slug': 'hair-styling',
                'description': 'Hair cutting, styling, and treatment services',
                'icon': '💇‍♀️',
                'is_active': True,
                'display_order': 2
            },
            {
                'name': 'Photography',
                'slug': 'photography',
                'description': 'Professional photography for events and portraits',
                'icon': '📸',
                'is_active': True,
                'display_order': 3
            },
            {
                'name': 'Fitness Training',
                'slug': 'fitness-training',
                'description': 'Personal training and fitness coaching',
                'icon': '💪',
                'is_active': True,
                'display_order': 4
            },
            {
                'name': 'Music Lessons',
                'slug': 'music-lessons',
                'description': 'Music instruction and lessons',
                'icon': '🎵',
                'is_active': True,
                'display_order': 5
            }
        ]
        
        for category in categories_data:
            columns = ', '.join(category.keys())
            placeholders = ', '.join([f':{key}' for key in category.keys()])
            
            await self.session.execute(text(f"""
                INSERT INTO service_categories ({columns})
                VALUES ({placeholders})
                ON CONFLICT (slug) DO NOTHING
            """), category)
        
        await self.session.commit()
        print("✅ Service categories seeded")
    
    async def seed_users(self):
        """Seed regular users"""
        print("👥 Seeding users...")
        
        # Create 50 realistic users
        for i in range(50):
            user_data = {
                'id': str(uuid.uuid4()),
                'email': fake.unique.email(),
                'phone': fake.phone_number()[:20],
                'hashed_password': bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                'is_active': True,
                'is_verified': random.choice([True, False]),
                'date_joined': fake.date_time_between(start_date='-2y', end_date='now'),
                'last_login': fake.date_time_between(start_date='-30d', end_date='now') if random.random() > 0.3 else None,
                'failed_login_attempts': random.randint(0, 2),
            }
            
            if user_data['is_verified']:
                user_data['email_verified_at'] = user_data['date_joined'] + timedelta(hours=random.randint(1, 24))
            
            columns = ', '.join(user_data.keys())
            placeholders = ', '.join([f':{key}' for key in user_data.keys()])
            
            await self.session.execute(text(f"""
                INSERT INTO users ({columns})
                VALUES ({placeholders})
                ON CONFLICT (email) DO NOTHING
            """), user_data)
            
            # Create user profile
            profile_data = {
                'user_id': user_data['id'],
                'first_name': fake.first_name(),
                'last_name': fake.last_name(),
                'date_of_birth': fake.date_of_birth(minimum_age=18, maximum_age=80),
                'gender': random.choice(['male', 'female', 'other']),
                'bio': fake.text(max_nb_chars=200) if random.random() > 0.5 else None,
                'profile_picture': fake.image_url() if random.random() > 0.7 else None,
                'location_city': fake.city(),
                'location_state': fake.state(),
                'location_country': fake.country_code(),
            }
            
            columns = ', '.join(profile_data.keys())
            placeholders = ', '.join([f':{key}' for key in profile_data.keys()])
            
            await self.session.execute(text(f"""
                INSERT INTO user_profiles ({columns})
                VALUES ({placeholders})
                ON CONFLICT (user_id) DO NOTHING
            """), profile_data)
        
        await self.session.commit()
        print("✅ Users and profiles seeded")
    
    async def seed_providers(self):
        """Seed service providers"""
        print("🎨 Seeding providers...")
        
        # Get some users to make them providers
        result = await self.session.execute(text("SELECT id FROM users LIMIT 15"))
        user_ids = [row[0] for row in result.fetchall()]
        
        for user_id in user_ids:
            provider_data = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'business_name': fake.company(),
                'description': fake.text(max_nb_chars=500),
                'experience_years': random.randint(1, 15),
                'hourly_rate': round(random.uniform(25.0, 200.0), 2),
                'is_verified': random.choice([True, False]),
                'is_available': random.choice([True, False]),
                'rating_average': round(random.uniform(3.5, 5.0), 1),
                'rating_count': random.randint(0, 100),
                'completed_services': random.randint(0, 50),
                'portfolio_images': [fake.image_url() for _ in range(random.randint(1, 5))],
                'specializations': random.sample(['bridal', 'editorial', 'commercial', 'fashion', 'portrait'], random.randint(1, 3)),
                'location_city': fake.city(),
                'location_state': fake.state(),
                'travel_radius': random.randint(10, 100),
                'created_at': fake.date_time_between(start_date='-1y', end_date='now'),
            }
            
            # Convert arrays to strings for insertion
            provider_data['portfolio_images'] = str(provider_data['portfolio_images'])
            provider_data['specializations'] = str(provider_data['specializations'])
            
            columns = ', '.join(provider_data.keys())
            placeholders = ', '.join([f':{key}' for key in provider_data.keys()])
            
            await self.session.execute(text(f"""
                INSERT INTO providers ({columns})
                VALUES ({placeholders})
                ON CONFLICT (user_id) DO NOTHING
            """), provider_data)
        
        await self.session.commit()
        print("✅ Providers seeded")
    
    async def seed_bookings(self):
        """Seed bookings"""
        print("📅 Seeding bookings...")
        
        # Get users and providers
        user_result = await self.session.execute(text("SELECT id FROM users LIMIT 30"))
        user_ids = [row[0] for row in user_result.fetchall()]
        
        provider_result = await self.session.execute(text("SELECT id FROM providers"))
        provider_ids = [row[0] for row in provider_result.fetchall()]
        
        if not provider_ids:
            print("⚠️  No providers found, skipping booking seeding")
            return
        
        # Create 100 bookings
        for i in range(100):
            start_time = fake.date_time_between(start_date='-30d', end_date='+30d')
            end_time = start_time + timedelta(hours=random.randint(1, 8))
            
            booking_data = {
                'id': str(uuid.uuid4()),
                'user_id': random.choice(user_ids),
                'provider_id': random.choice(provider_ids),
                'service_type': random.choice(['makeup', 'hair-styling', 'photography', 'fitness-training', 'music-lessons']),
                'status': random.choice(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
                'start_time': start_time,
                'end_time': end_time,
                'location_address': fake.address(),
                'location_city': fake.city(),
                'location_state': fake.state(),
                'location_zip': fake.zipcode(),
                'total_amount': round(random.uniform(50.0, 500.0), 2),
                'service_fee': round(random.uniform(5.0, 50.0), 2),
                'special_requirements': fake.text(max_nb_chars=200) if random.random() > 0.7 else None,
                'cancellation_reason': fake.text(max_nb_chars=100) if booking_data.get('status') == 'cancelled' else None,
                'created_at': fake.date_time_between(start_date='-60d', end_date='now'),
            }
            
            columns = ', '.join(booking_data.keys())
            placeholders = ', '.join([f':{key}' for key in booking_data.keys()])
            
            await self.session.execute(text(f"""
                INSERT INTO bookings ({columns})
                VALUES ({placeholders})
            """), booking_data)
        
        await self.session.commit()
        print("✅ Bookings seeded")
    
    async def seed_reviews(self):
        """Seed reviews"""
        print("⭐ Seeding reviews...")
        
        # Get completed bookings
        result = await self.session.execute(text("""
            SELECT id, user_id, provider_id FROM bookings 
            WHERE status = 'completed' 
            LIMIT 50
        """))
        completed_bookings = result.fetchall()
        
        for booking_id, user_id, provider_id in completed_bookings:
            if random.random() > 0.3:  # 70% chance of review
                review_data = {
                    'id': str(uuid.uuid4()),
                    'booking_id': booking_id,
                    'reviewer_id': user_id,
                    'provider_id': provider_id,
                    'rating': random.randint(3, 5),
                    'title': fake.sentence(nb_words=4),
                    'comment': fake.text(max_nb_chars=300),
                    'is_verified': True,
                    'helpful_count': random.randint(0, 20),
                    'created_at': fake.date_time_between(start_date='-30d', end_date='now'),
                }
                
                columns = ', '.join(review_data.keys())
                placeholders = ', '.join([f':{key}' for key in review_data.keys()])
                
                await self.session.execute(text(f"""
                    INSERT INTO user_reviews ({columns})
                    VALUES ({placeholders})
                """), review_data)
        
        await self.session.commit()
        print("✅ Reviews seeded")
    
    async def seed_payments(self):
        """Seed payment transactions"""
        print("💳 Seeding payments...")
        
        # Get bookings with amounts
        result = await self.session.execute(text("""
            SELECT id, user_id, total_amount FROM bookings 
            WHERE status IN ('confirmed', 'completed')
            LIMIT 80
        """))
        bookings = result.fetchall()
        
        for booking_id, user_id, amount in bookings:
            if random.random() > 0.1:  # 90% have payments
                payment_data = {
                    'id': str(uuid.uuid4()),
                    'booking_id': booking_id,
                    'user_id': user_id,
                    'amount': amount,
                    'currency': 'USD',
                    'payment_method': random.choice(['credit_card', 'debit_card', 'paypal', 'apple_pay']),
                    'status': random.choice(['pending', 'completed', 'failed', 'refunded']),
                    'transaction_id': fake.uuid4(),
                    'gateway_transaction_id': fake.uuid4(),
                    'gateway_response': '{"status": "success", "message": "Payment processed"}',
                    'processed_at': fake.date_time_between(start_date='-30d', end_date='now'),
                    'created_at': fake.date_time_between(start_date='-30d', end_date='now'),
                }
                
                columns = ', '.join(payment_data.keys())
                placeholders = ', '.join([f':{key}' for key in payment_data.keys()])
                
                await self.session.execute(text(f"""
                    INSERT INTO payment_transactions ({columns})
                    VALUES ({placeholders})
                """), payment_data)
        
        await self.session.commit()
        print("✅ Payments seeded")
    
    async def generate_summary(self):
        """Generate seeding summary"""
        print("\n" + "="*60)
        print("🎉 DATA SEEDING COMPLETED SUCCESSFULLY!")
        print("="*60)
        
        # Count records in each table
        tables_to_count = [
            'roles', 'permissions', 'admin_users', 'users', 
            'user_profiles', 'service_categories', 'providers', 
            'bookings', 'user_reviews', 'payment_transactions'
        ]
        
        for table in tables_to_count:
            try:
                result = await self.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"📊 {table.replace('_', ' ').title()}: {count} records")
            except Exception as e:
                print(f"❌ Could not count {table}: {e}")
        
        print("\n🔐 Default Admin Credentials:")
        print("   Email: admin@maya.com")
        print("   Password: admin123")
        print("\n💡 All user accounts use password: password123")
        print("\n📚 Ready to test with the Postman collection!")
    
    async def run(self):
        """Main seeding process"""
        try:
            await self.setup_database()
            await self.clear_data()
            await self.seed_roles_and_permissions()
            await self.seed_admin_users()
            await self.seed_service_categories()
            await self.seed_users()
            await self.seed_providers()
            await self.seed_bookings()
            await self.seed_reviews()
            await self.seed_payments()
            await self.generate_summary()
            
        except Exception as e:
            print(f"❌ Seeding failed: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            if self.session:
                await self.session.close()
            if self.engine:
                await self.engine.dispose()


async def main():
    """Main function"""
    reset_mode = '--reset' in sys.argv
    seeder = DataSeeder(reset_data=reset_mode)
    await seeder.run()


if __name__ == "__main__":
    asyncio.run(main())