const express = require('express');
const router = express.Router();
const projectCtrl = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.post('/', auth, projectCtrl.createProject);
router.get('/', auth, projectCtrl.getProjects);
router.delete('/:id', auth, projectCtrl.deleteProject);
router.post('/:id/members', auth, projectCtrl.addMember);

module.exports = router;