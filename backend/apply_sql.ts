import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    const sql = fs.readFileSync('migration.sql', 'utf16le');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const statement of statements) {
        console.log("Executing:", statement.substring(0, 50) + "...");
        await prisma.$executeRawUnsafe(statement);
    }
    console.log("Database tables created successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
