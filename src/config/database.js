const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Conectar ao banco
async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Desconectar do banco
async function disconnectDatabase() {
    await prisma.$disconnect();
}

module.exports = {
    prisma,
    connectDatabase,
    disconnectDatabase,
};