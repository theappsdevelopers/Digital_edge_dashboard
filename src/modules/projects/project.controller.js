const mongoose = require('mongoose');
const { listProjects, createProject, updateProject, deleteProject } = require('./project.service');

function toProjectResponse(p) {
  return {
    id: String(p._id),
    name: p.name,
    client_id: p.client ? String(p.client) : null,
    total_value: p.totalValue,
    start_date: p.startDate,
    end_date: p.endDate,
    status: p.status,
    description: p.description,
    notes: p.notes,
  };
}

async function getProjects(req, res) {
  try {
    const projects = await listProjects();
    res.json(projects.map(toProjectResponse));
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function postProject(req, res) {
  try {
    const { name, client_id, total_value } = req.body || {};
    if (!name || !client_id) {
      return res.status(400).json({ error: 'name and client_id are required' });
    }
    if (total_value == null || typeof total_value !== 'number') {
      return res.status(400).json({ error: 'total_value (number) is required' });
    }
    const project = await createProject(req.body);
    res.status(201).json(toProjectResponse(project));
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
}

async function putProject(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid project id is required' });
    }
    const { name, client_id, total_value } = req.body || {};
    if (!name || !client_id) {
      return res.status(400).json({ error: 'name and client_id are required' });
    }
    if (total_value == null || typeof total_value !== 'number') {
      return res.status(400).json({ error: 'total_value (number) is required' });
    }
    const project = await updateProject(id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(toProjectResponse(project));
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message || 'Failed to update project' });
  }
}

async function deleteProjectHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid project id is required' });
    }
    const project = await deleteProject(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message || 'Failed to delete project' });
  }
}

module.exports = {
  getProjects,
  postProject,
  putProject,
  deleteProjectHandler,
};

