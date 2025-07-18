const { prisma } = require('../config/database');
const { canTeamJoinChampionship } = require('../utils/helpers');

class ChampionshipController {
    // Listar campeonatos do usuário
    async index(req, res) {
        try {
            const championships = await prisma.championship.findMany({
                where: { userId: req.user.id },
                include: {
                    _count: {
                        select: { championshipTeams: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ championships });
            }

            res.render('championships/index', {
                title: 'Meus Campeonatos',
                championships
            });
        } catch (error) {
            console.error('Championships index error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao carregar campeonatos' });
            }

            req.session.errors = ['Erro ao carregar campeonatos'];
            res.redirect('/dashboard');
        }
    }

    // Mostrar formulário de criação
    async create(req, res) {
        res.render('championships/create', {
            title: 'Novo Campeonato',
            levels: ['Nacional', 'Continental', 'Mundial'],
            continents: ['América do Sul', 'América do Norte', 'Europa', 'África', 'Ásia', 'Oceania']
        });
    }

    // Criar novo campeonato
    async store(req, res) {
        try {
            const {
                name,
                level,
                maxTeams,
                minTeams,
                country,
                continent
            } = req.body;

            // Validar dados específicos por nível
            let championshipData = {
                name,
                level,
                maxTeams: parseInt(maxTeams),
                minTeams: parseInt(minTeams),
                userId: req.user.id
            };

            if (level === 'Nacional') {
                championshipData.country = country;
                championshipData.continent = null;
            } else if (level === 'Continental') {
                championshipData.continent = continent;
                championshipData.country = null;
            } else {
                championshipData.country = null;
                championshipData.continent = null;
            }

            const championship = await prisma.championship.create({
                data: championshipData
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(201).json({
                    message: 'Campeonato criado com sucesso',
                    championship
                });
            }

            req.session.success = 'Campeonato criado com sucesso!';
            res.redirect('/championships');
        } catch (error) {
            console.error('Championship store error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao criar campeonato' });
            }

            req.session.errors = ['Erro ao criar campeonato'];
            res.redirect('/championships/create');
        }
    }

    // Mostrar detalhes do campeonato
    async show(req, res) {
        try {
            const { id } = req.params;

            const championship = await prisma.championship.findFirst({
                where: {
                    id,
                    userId: req.user.id
                },
                include: {
                    championshipTeams: {
                        include: {
                            team: true
                        }
                    }
                }
            });

            if (!championship) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(404).json({ error: 'Campeonato não encontrado' });
                }

                req.session.errors = ['Campeonato não encontrado'];
                return res.redirect('/championships');
            }

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ championship });
            }

            res.render('championships/show', {
                title: championship.name,
                championship
            });
        } catch (error) {
            console.error('Championship show error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao carregar campeonato' });
            }

            req.session.errors = ['Erro ao carregar campeonato'];
            res.redirect('/championships');
        }
    }

    // Mostrar página de gerenciamento (inscrições)
    async manage(req, res) {
        try {
            const { id } = req.params;

            const championship = await prisma.championship.findFirst({
                where: {
                    id,
                    userId: req.user.id
                },
                include: {
                    championshipTeams: {
                        include: {
                            team: true
                        }
                    }
                }
            });

            if (!championship) {
                req.session.errors = ['Campeonato não encontrado'];
                return res.redirect('/championships');
            }

            // Buscar equipes elegíveis para o campeonato
            const eligibleTeams = await prisma.team.findMany({
                where: {
                    userId: req.user.id,
                    NOT: {
                        championshipTeams: {
                            some: {
                                championshipId: id
                            }
                        }
                    }
                }
            });

            const filteredTeams = eligibleTeams.filter(team =>
                canTeamJoinChampionship(team, championship)
            );

            res.render('championships/manage', {
                title: `Gerenciar ${championship.name}`,
                championship,
                eligibleTeams: filteredTeams
            });
        } catch (error) {
            console.error('Championship manage error:', error);
            req.session.errors = ['Erro ao carregar campeonato'];
            res.redirect('/championships');
        }
    }

    // Inscrever equipe no campeonato
    async enrollTeam(req, res) {
        try {
            const { id } = req.params;
            const { teamId } = req.body;

            const championship = await prisma.championship.findFirst({
                where: {
                    id,
                    userId: req.user.id
                },
                include: {
                    _count: {
                        select: { championshipTeams: true }
                    }
                }
            });

            if (!championship) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(404).json({ error: 'Campeonato não encontrado' });
                }

                req.session.errors = ['Campeonato não encontrado'];
                return res.redirect('/championships');
            }

            // Verificar se campeonato não está lotado
            if (championship._count.championshipTeams >= championship.maxTeams) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(400).json({ error: 'Campeonato lotado' });
                }

                req.session.errors = ['Campeonato lotado'];
                return res.redirect(`/championships/${id}/manage`);
            }

            // Buscar equipe
            const team = await prisma.team.findFirst({
                where: {
                    id: teamId,
                    userId: req.user.id
                }
            });

            if (!team) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(404).json({ error: 'Equipe não encontrada' });
                }

                req.session.errors = ['Equipe não encontrada'];
                return res.redirect(`/championships/${id}/manage`);
            }

            // Verificar se equipe pode participar
            if (!canTeamJoinChampionship(team, championship)) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(400).json({ error: 'Equipe não elegível para este campeonato' });
                }

                req.session.errors = ['Equipe não elegível para este campeonato'];
                return res.redirect(`/championships/${id}/manage`);
            }

            // Verificar se equipe já está inscrita
            const existingEnrollment = await prisma.championshipTeam.findFirst({
                where: {
                    championshipId: id,
                    teamId: teamId
                }
            });

            if (existingEnrollment) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(400).json({ error: 'Equipe já inscrita' });
                }

                req.session.errors = ['Equipe já inscrita'];
                return res.redirect(`/championships/${id}/manage`);
            }

            // Inscrever equipe
            await prisma.championshipTeam.create({
                data: {
                    championshipId: id,
                    teamId: teamId
                }
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ message: 'Equipe inscrita com sucesso' });
            }

            req.session.success = 'Equipe inscrita com sucesso!';
            res.redirect(`/championships/${id}/manage`);
        } catch (error) {
            console.error('Championship enroll error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao inscrever equipe' });
            }

            req.session.errors = ['Erro ao inscrever equipe'];
            res.redirect(`/championships/${req.params.id}/manage`);
        }
    }

    // Remover equipe do campeonato
    async removeTeam(req, res) {
        try {
            const { id, teamId } = req.params;

            const championship = await prisma.championship.findFirst({
                where: {
                    id,
                    userId: req.user.id
                }
            });

            if (!championship) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(404).json({ error: 'Campeonato não encontrado' });
                }

                req.session.errors = ['Campeonato não encontrado'];
                return res.redirect('/championships');
            }

            await prisma.championshipTeam.deleteMany({
                where: {
                    championshipId: id,
                    teamId: teamId
                }
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ message: 'Equipe removida com sucesso' });
            }

            req.session.success = 'Equipe removida com sucesso!';
            res.redirect(`/championships/${id}/manage`);
        } catch (error) {
            console.error('Championship remove team error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao remover equipe' });
            }

            req.session.errors = ['Erro ao remover equipe'];
            res.redirect(`/championships/${req.params.id}/manage`);
        }
    }
}

module.exports = new ChampionshipController();