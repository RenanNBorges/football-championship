const express = require('express');
const championshipController = require('../../controllers/championshipController');
const { requireAuth } = require('../../middleware/auth');
const { validateChampionship, handleValidationErrors } = require('../../middleware/validation');
const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Listar campeonatos
router.get('/', championshipController.index);

// Formulário de criação
router.get('/create', championshipController.create);

// Criar campeonato
router.post('/', validateChampionship, handleValidationErrors, championshipController.store);

// Mostrar campeonato
router.get('/:id', championshipController.show);

// Gerenciar campeonato (inscrições)
router.get('/:id/manage', championshipController.manage);

// Inscrever equipe
router.post('/:id/enroll', championshipController.enrollTeam);

// Remover equipe
router.delete('/:id/teams/:teamId', championshipController.removeTeam);

module.exports = router;