const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { prisma } = require('../../config/database');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Football Championship Platform'
    });
});

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
        req.session.errors = ['Erro ao carregar dashboard'];
        res.redirect('/');
    }
});

router.get('/teams-api-example', (req, res) => {
    res.render('teams-api-example', { title: 'Exemplo API' });
});

module.exports = router;
