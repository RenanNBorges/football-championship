const express = require('express');
const teamController = require('../../controllers/teamController');
const { requireApiAuth } = require('../../middleware/auth');
const { validateTeam, handleValidationErrors } = require('../../middleware/validation');
const router = express.Router();

router.use(requireApiAuth);

router.get('/', teamController.index);
router.post('/', validateTeam, handleValidationErrors, teamController.store);
router.get('/:id', teamController.show);
router.put('/:id', validateTeam, handleValidationErrors, teamController.update);
router.delete('/:id', teamController.destroy);

module.exports = router;
