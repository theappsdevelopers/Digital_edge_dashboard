const express = require('express');
const { getMilestones, postMilestone, putMilestone, deleteMilestoneHandler } = require('./milestone.controller');

const router = express.Router();

router.get('/', getMilestones);
router.post('/', postMilestone);
router.put('/:id', putMilestone);
router.delete('/:id', deleteMilestoneHandler);

module.exports = router;

