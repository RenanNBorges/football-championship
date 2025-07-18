const { prisma } = require('../config/database');
const { calculateTeamOverall } = require('../utils/helpers');

class TeamController {
    // Listar todas as equipes do usuário
    async index(req, res) {
        try {
            const teams = await prisma.team.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' }
            });

            const teamsWithOverall = teams.map(team => ({
                ...team,
                overall: calculateTeamOverall(team)
            }));

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ teams: teamsWithOverall });
            }

            res.render('teams/index', {
                title: 'Minhas Equipes',
                teams: teamsWithOverall
            });
        } catch (error) {
            console.error('Teams index error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao carregar equipes' });
            }

            req.session.errors = ['Erro ao carregar equipes'];
            res.redirect('/dashboard');
        }
    }

    // Mostrar formulário de criação
    async create(req, res) {
        res.render('teams/create', {
            title: 'Nova Equipe',
            continents: ['América do Sul', 'América do Norte', 'Europa', 'África', 'Ásia', 'Oceania']
        });
    }

    // Criar nova equipe
    async store(req, res) {
        try {
            const {
                name,
                primaryColor,
                secondaryColor,
                attackLevel,
                midfieldLevel,
                defenseLevel,
                resistanceLevel,
                country,
                continent
            } = req.body;

            const team = await prisma.team.create({
                data: {
                    name,
                    primaryColor,
                    secondaryColor,
                    attackLevel: parseInt(attackLevel),
                    midfieldLevel: parseInt(midfieldLevel),
                    defenseLevel: parseInt(defenseLevel),
                    resistanceLevel: parseInt(resistanceLevel),
                    country,
                    continent,
                    userId: req.user.id
                }
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(201).json({
                    message: 'Equipe criada com sucesso',
                    team: {
                        ...team,
                        overall: calculateTeamOverall(team)
                    }
                });
            }

            req.session.success = 'Equipe criada com sucesso!';
            res.redirect('/teams');
        } catch (error) {
            console.error('Team store error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao criar equipe' });
            }

            req.session.errors = ['Erro ao criar equipe'];
            res.redirect('/teams/create');
        }
    }

    // Mostrar detalhes da equipe
    async show(req, res) {
        try {
            const { id } = req.params;

            const team = await prisma.team.findFirst({
                where: {
                    id,
                    userId: req.user.id
                },
                include: {
                    championshipTeams: {
                        include: {
                            championship: true
                        }
                    }
                }
            });

            if (!team) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(404).json({ error: 'Equipe não encontrada' });
                }

                req.session.errors = ['Equipe não encontrada'];
                return res.redirect('/teams');
            }

            const teamWithOverall = {
                ...team,
                overall: calculateTeamOverall(team)
            };

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ team: teamWithOverall });
            }

            res.render('teams/show', {
                title: team.name,
                team: teamWithOverall
            });
        } catch (error) {
            console.error('Team show error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao carregar equipe' });
            }

            req.session.errors = ['Erro ao carregar equipe'];
            res.redirect('/teams');
        }
    }

    // Mostrar formulário de edição
    async edit(req, res) {
        try {
            const { id } = req.params;

            const team = await prisma.team.findFirst({
                where: {
                    id,
                    userId: req.user.id
                }
            });

            if (!team) {
                req.session.errors = ['Equipe não encontrada'];
                return res.redirect('/teams');
            }

            res.render('teams/edit', {
                title: `Editar ${team.name}`,
                team,
                continents: ['América do Sul', 'América do Norte', 'Europa', 'África', 'Ásia', 'Oceania']
            });
        } catch (error) {
            console.error('Team edit error:', error);
            req.session.errors = ['Erro ao carregar equipe'];
            res.redirect('/teams');
        }
    }

    // Atualizar equipe
    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                primaryColor,
                secondaryColor,
                attackLevel,
                midfieldLevel,
                defenseLevel,
                resistanceLevel,
                country,
                continent
            } = req.body;

            const team = await prisma.team.findFirst({
                where: {
                    id,
                    userId: req.user.id
                }
            });

            if (!team) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(404).json({ error: 'Equipe não encontrada' });
                }

                req.session.errors = ['Equipe não encontrada'];
                return res.redirect('/teams');
            }

            const updatedTeam = await prisma.team.update({
                where: { id },
                data: {
                    name,
                    primaryColor,
                    secondaryColor,
                    attackLevel: parseInt(attackLevel),
                    midfieldLevel: parseInt(midfieldLevel),
                    defenseLevel: parseInt(defenseLevel),
                    resistanceLevel: parseInt(resistanceLevel),
                    country,
                    continent
                }
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({
                    message: 'Equipe atualizada com sucesso',
                    team: {
                        ...updatedTeam,
                        overall: calculateTeamOverall(updatedTeam)
                    }
                });
            }

            req.session.success = 'Equipe atualizada com sucesso!';
            res.redirect('/teams');
        } catch (error) {
            console.error('Team update error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao atualizar equipe' });
            }

            req.session.errors = ['Erro ao atualizar equipe'];
            res.redirect(`/teams/${req.params.id}/edit`);
        }
    }

    // Deletar equipe
    async destroy(req, res) {
        try {
            const { id } = req.params;

            const team = await prisma.team.findFirst({
                where: {
                    id,
                    userId: req.user.id
                }
            });

            if (!team) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(404).json({ error: 'Equipe não encontrada' });
                }

                req.session.errors = ['Equipe não encontrada'];
                return res.redirect('/teams');
            }

            await prisma.team.delete({
                where: { id }
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ message: 'Equipe deletada com sucesso' });
            }

            req.session.success = 'Equipe deletada com sucesso!';
            res.redirect('/teams');
        } catch (error) {
            console.error('Team destroy error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro ao deletar equipe' });
            }

            req.session.errors = ['Erro ao deletar equipe'];
            res.redirect('/teams');
        }
    }
}

module.exports = new TeamController();