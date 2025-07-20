function requireAuth(req, res, next) {
    if (!req.user) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/auth/login');
    }
    next();
}

async function requireApiAuth(req, res, next) {
    const { verifyToken, extractTokenFromHeader } = require('../config/auth');
    const { prisma } = require('../config/database');

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
        res.status(401).json({ error: 'Erro de autenticação' });
    }
}

module.exports = {
    requireAuth,
    requireApiAuth,
};
