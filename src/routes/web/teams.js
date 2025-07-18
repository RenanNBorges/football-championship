const express = require('express');
const teamController = require('../../controllers/teamController');
const { requireAuth } = require('../../middleware/auth');
const { validateTeam, handleValidationErrors } = require('../../middleware/validation');
const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Listar equipes
router.get('/', teamController.index);

// Formulário de criação
router.get('/create', teamController.create);

// Criar equipe
router.post('/', validateTeam, handleValidationErrors, teamController.store);

// Mostrar equipe
router.get('/:id', teamController.show);

// Formulário de edição
router.get('/:id/edit', teamController.edit);

// Atualizar equipe
router.put('/:id', validateTeam, handleValidationErrors, teamController.update);

// Deletar equipe
router.delete('/:id', teamController.destroy);

module.exports = router;