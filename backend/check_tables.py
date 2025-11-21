#!/usr/bin/env python3
import asyncio
from app.core.database import engine
from sqlalchemy import text

async def check_tables():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables = result.fetchall()
        print('Existing tables:')
        for row in tables:
            print(f'  - {row[0]}')

if __name__ == "__main__":
    asyncio.run(check_tables())