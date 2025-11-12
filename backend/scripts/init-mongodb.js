// MongoDB initialization script for Maya Platform
// This script runs when the MongoDB container starts for the first time

// Get database name from environment or use default
const dbName = process.env.MONGO_INITDB_DATABASE || 'maya_platform_mongo';

// Switch to the application database
db = db.getSiblingDB(dbName);

// Create collections with proper validation and indexes
print(`Creating Maya Platform MongoDB collections in database: ${dbName}...`);

// 1. Chats Collection
db.createCollection('chats', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['_id', 'participants', 'created_at'],
            properties: {
                _id: { bsonType: 'string', description: 'UUID string' },
                participants: { 
                    bsonType: 'array', 
                    items: { bsonType: 'string' },
                    description: 'Array of participant UUIDs' 
                },
                booking_id: { bsonType: ['string', 'null'] },
                last_message: { bsonType: 'object' },
                created_at: { bsonType: 'date' },
                updated_at: { bsonType: 'date' }
            }
        }
    }
});

// Create TTL index for chats (30 days)
db.chats.createIndex({ 'created_at': 1 }, { expireAfterSeconds: 2592000 });
db.chats.createIndex({ 'participants': 1 });
db.chats.createIndex({ 'booking_id': 1 });

// 2. User Activities Collection
db.createCollection('user_activities', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['_id', 'user_id', 'activity_type', 'timestamp'],
            properties: {
                _id: { bsonType: 'string' },
                user_id: { bsonType: 'string' },
                activity_type: { bsonType: 'string' },
                activity_data: { bsonType: 'object' },
                timestamp: { bsonType: 'date' },
                ip_address: { bsonType: 'string' },
                user_agent: { bsonType: 'string' }
            }
        }
    }
});

// Create TTL index for user activities (90 days)
db.user_activities.createIndex({ 'timestamp': 1 }, { expireAfterSeconds: 7776000 });
db.user_activities.createIndex({ 'user_id': 1, 'timestamp': -1 });
db.user_activities.createIndex({ 'activity_type': 1 });

// 3. Analytics Events Collection
db.createCollection('analytics_events', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['_id', 'event_type', 'timestamp'],
            properties: {
                _id: { bsonType: 'string' },
                event_type: { bsonType: 'string' },
                event_data: { bsonType: 'object' },
                user_id: { bsonType: ['string', 'null'] },
                session_id: { bsonType: 'string' },
                timestamp: { bsonType: 'date' }
            }
        }
    }
});

// Create TTL index for analytics events (365 days)
db.analytics_events.createIndex({ 'timestamp': 1 }, { expireAfterSeconds: 31536000 });
db.analytics_events.createIndex({ 'event_type': 1, 'timestamp': -1 });
db.analytics_events.createIndex({ 'user_id': 1, 'timestamp': -1 });
db.analytics_events.createIndex({ 'session_id': 1 });

// 4. Provider Portfolios Collection
db.createCollection('provider_portfolios', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['_id', 'provider_id'],
            properties: {
                _id: { bsonType: 'string' },
                provider_id: { bsonType: 'string' },
                portfolio_items: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        properties: {
                            type: { bsonType: 'string', enum: ['image', 'video', 'document'] },
                            url: { bsonType: 'string' },
                            title: { bsonType: 'string' },
                            description: { bsonType: 'string' },
                            metadata: { bsonType: 'object' }
                        }
                    }
                },
                created_at: { bsonType: 'date' },
                updated_at: { bsonType: 'date' }
            }
        }
    }
});

db.provider_portfolios.createIndex({ 'provider_id': 1 }, { unique: true });
db.provider_portfolios.createIndex({ 'portfolio_items.type': 1 });

// 5. Dynamic Content Collection
db.createCollection('dynamic_content', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['_id', 'content_type', 'status'],
            properties: {
                _id: { bsonType: 'string' },
                content_type: { bsonType: 'string' },
                title: { bsonType: 'string' },
                content: { bsonType: 'object' },
                metadata: { bsonType: 'object' },
                status: { bsonType: 'string', enum: ['draft', 'published', 'archived'] },
                created_at: { bsonType: 'date' },
                updated_at: { bsonType: 'date' },
                published_at: { bsonType: ['date', 'null'] }
            }
        }
    }
});

db.dynamic_content.createIndex({ 'content_type': 1, 'status': 1 });
db.dynamic_content.createIndex({ 'status': 1, 'published_at': -1 });

// 6. Time Series Data Collection
db.createCollection('time_series_data', {
    timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'hours'
    }
});

// Create TTL index for time series data (30 days)
db.time_series_data.createIndex({ 'timestamp': 1 }, { expireAfterSeconds: 2592000 });
db.time_series_data.createIndex({ 'metadata.metric_type': 1, 'timestamp': -1 });

// Create administrative user for the application
const appUserName = process.env.MONGODB_APP_USER || 'maya_app_user';
const appUserPassword = process.env.MONGODB_APP_PASSWORD || 'maya_app_password';

db.createUser({
    user: appUserName,
    pwd: appUserPassword,
    roles: [
        { role: 'readWrite', db: dbName }
    ]
});

print('Maya Platform MongoDB initialization completed successfully');
print('Collections created: chats, user_activities, analytics_events, provider_portfolios, dynamic_content, time_series_data');
print('Indexes and TTL policies configured');
print(`Application user created: ${appUserName}`);