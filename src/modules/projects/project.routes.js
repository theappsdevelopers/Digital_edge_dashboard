const express = require('express');
const { getProjects, postProject, putProject, deleteProjectHandler } = require('./project.controller');

const router = express.Router();

router.get('/', getProjects);
router.post('/', postProject);
router.put('/:id', putProject);
router.delete('/:id', deleteProjectHandler);

module.exports = router;

