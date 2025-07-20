const express = require('express');
const championshipController = require('../../controllers/championshipController');
const { requireApiAuth } = require('../../middleware/auth');
const { validateChampionship, handleValidationErrors } = require('../../middleware/validation');
const router = express.Router();

router.use(requireApiAuth);

router.get('/', championshipController.index);
router.post('/', validateChampionship, handleValidationErrors, championshipController.store);
router.get('/:id', championshipController.show);
router.post('/:id/enroll', championshipController.enrollTeam);
router.delete('/:id/teams/:teamId', championshipController.removeTeam);

module.exports = router;
