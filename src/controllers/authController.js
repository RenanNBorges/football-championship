const { prisma } = require('../config/database');
const { hashPassword, verifyPassword, generateToken } = require('../config/auth');

class AuthController {
    // Registrar novo usuário
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Verificar se usuário já existe
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(400).json({ error: 'Email já cadastrado' });
                }
                req.session.errors = ['Email já cadastrado'];
                return res.redirect('/auth/register');
            }

            // Criar usuário
            const hashedPassword = await hashPassword(password);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                }
            });

            // Resposta para API
            if (req.originalUrl.startsWith('/api/')) {
                const token = generateToken({ userId: user.id });
                return res.status(201).json({
                    message: 'Usuário criado com sucesso',
                    user,
                    token,
                });
            }

            // Resposta para web (sessão)
            req.session.userId = user.id;
            req.session.success = 'Conta criada com sucesso!';
            res.redirect('/dashboard');

        } catch (error) {
            console.error('Register error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            req.session.errors = ['Erro ao criar conta'];
            res.redirect('/auth/register');
        }
    }

    // Login do usuário
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuário
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(401).json({ error: 'Credenciais inválidas' });
                }
                req.session.errors = ['Email ou senha inválidos'];
                return res.redirect('/auth/login');
            }

            // Verificar senha
            const isPasswordValid = await verifyPassword(password, user.password);
            if (!isPasswordValid) {
                if (req.originalUrl.startsWith('/api/')) {
                    return res.status(401).json({ error: 'Credenciais inválidas' });
                }
                req.session.errors = ['Email ou senha inválidos'];
                return res.redirect('/auth/login');
            }

            // Resposta para API
            if (req.originalUrl.startsWith('/api/')) {
                const token = generateToken({ userId: user.id });
                return res.json({
                    message: 'Login realizado com sucesso',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                    token,
                });
            }

            // Resposta para web (sessão)
            req.session.userId = user.id;
            req.session.success = `Bem-vindo, ${user.name}!`;
            res.redirect('/dashboard');

        } catch (error) {
            console.error('Login error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            req.session.errors = ['Erro ao fazer login'];
            res.redirect('/auth/login');
        }
    }

    // Logout do usuário
    async logout(req, res) {
        try {
            // Para web, destruir sessão
            if (!req.originalUrl.startsWith('/api/')) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Logout error:', err);
                    }
                    res.redirect('/auth/login');
                });
                return;
            }

            // Para API, apenas confirmar logout (cliente deve descartar token)
            res.json({ message: 'Logout realizado com sucesso' });

        } catch (error) {
            console.error('Logout error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            res.redirect('/auth/login');
        }
    }

    // Obter perfil do usuário logado
    async profile(req, res) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    _count: {
                        select: {
                            teams: true,
                            championships: true,
                        }
                    }
                }
            });

            if (req.originalUrl.startsWith('/api/')) {
                return res.json({ user });
            }

            res.render('profile', { user });

        } catch (error) {
            console.error('Profile error:', error);

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            req.session.errors = ['Erro ao carregar perfil'];
            res.redirect('/dashboard');
        }
    }
}

module.exports = new AuthController();