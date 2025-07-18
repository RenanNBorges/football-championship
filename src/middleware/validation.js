const { body, validationResult } = require('express-validator');

// Middleware para processar erros de validação
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);

        // Para API, retornar JSON
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errorMessages
            });
        }

        // Para web, adicionar flash message e redirecionar
        req.session.errors = errorMessages;
        return res.redirect('back');
    }

    next();
}

// Validações para registro
const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nome deve ter entre 2 e 50 caracteres'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Confirmação de senha não confere');
            }
            return true;
        }),
];

// Validações para login
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),

    body('password')
        .notEmpty()
        .withMessage('Senha é obrigatória'),
];

// Validações para equipe
const validateTeam = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nome da equipe deve ter entre 2 e 50 caracteres'),

    body('primaryColor')
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('Cor primária deve ser um código hexadecimal válido'),

    body('secondaryColor')
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('Cor secundária deve ser um código hexadecimal válido'),

    body('attackLevel')
        .isInt({ min: 1, max: 10 })
        .withMessage('Nível de ataque deve ser entre 1 e 10'),

    body('midfieldLevel')
        .isInt({ min: 1, max: 10 })
        .withMessage('Nível de meio-campo deve ser entre 1 e 10'),

    body('defenseLevel')
        .isInt({ min: 1, max: 10 })
        .withMessage('Nível de defesa deve ser entre 1 e 10'),

    body('resistanceLevel')
        .isInt({ min: 1, max: 10 })
        .withMessage('Nível de resistência deve ser entre 1 e 10'),

    body('country')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('País deve ter entre 2 e 50 caracteres'),

    body('continent')
        .isIn(['América do Sul', 'América do Norte', 'Europa', 'África', 'Ásia', 'Oceania'])
        .withMessage('Continente inválido'),
];

// Validações para campeonato
const validateChampionship = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome do campeonato deve ter entre 2 e 100 caracteres'),

    body('level')
        .isIn(['Nacional', 'Continental', 'Mundial'])
        .withMessage('Nível deve ser Nacional, Continental ou Mundial'),

    body('maxTeams')
        .isInt({ min: 2, max: 64 })
        .withMessage('Número máximo de equipes deve ser entre 2 e 64'),

    body('minTeams')
        .isInt({ min: 2, max: 32 })
        .withMessage('Número mínimo de equipes deve ser entre 2 e 32'),

    body('country')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('País deve ter entre 2 e 50 caracteres'),

    body('continent')
        .optional()
        .isIn(['América do Sul', 'América do Norte', 'Europa', 'África', 'Ásia', 'Oceania'])
        .withMessage('Continente inválido'),
];

module.exports = {
    handleValidationErrors,
    validateRegister,
    validateLogin,
    validateTeam,
    validateChampionship,
};