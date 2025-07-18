const { verifyToken, extractTokenFromHeader } = require('../config/auth');
const { prisma } = require('../config/database');

// Middleware para rotas web (sessão)
async function requireAuth(req, res, next) {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/auth/login');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true }
        });

        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.redirect('/auth/login');
    }
}

// Middleware para rotas API (JWT)
async function requireApiAuth(req, res, next) {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('API auth middleware error:', error);
        res.status(401).json({ error: 'Erro de autenticação' });
    }
}

// Middleware opcional para rotas web (para mostrar dados do usuário se logado)
async function optionalAuth(req, res, next) {
    try {
        const userId = req.session.userId;

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, name: true }
            });

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
}

module.exports = {
    requireAuth,
    requireApiAuth,
    optionalAuth,
};