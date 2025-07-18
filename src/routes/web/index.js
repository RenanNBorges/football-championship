const express = require('express');
const { optionalAuth, requireAuth } = require('../../middleware/auth');
const { prisma } = require('../../config/database');
const router = express.Router();

// Página inicial
router.get('/', optionalAuth, (req, res) => {
    res.render('index', {
        title: 'Football Championship Platform'
    });
});

// Dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const [teams, championships] = await Promise.all([
            prisma.team.findMany({
                where: { userId: req.user.id },
                take: 5,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.championship.findMany({
                where: { userId: req.user.id },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { championshipTeams: true }
                    }
                }
            })
        ]);

        res.render('dashboard', {
            title: 'Dashboard',
            teams,
            championships
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.session.errors = ['Erro ao carregar dashboard'];
        res.redirect('/');
    }
});

module.exports = router;