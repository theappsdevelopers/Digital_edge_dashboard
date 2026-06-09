const { listMilestones, createMilestone, updateMilestone, deleteMilestone } = require('./milestone.service');

async function getMilestones(req, res) {
  try {
    const milestones = await listMilestones();
    const mapped = milestones.map((m) => ({
      id: String(m._id),
      name: m.name,
      project_id: m.project ? String(m.project) : null,
      value: m.value,
      due_date: m.dueDate,
      status: m.status,
      description: m.description,
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
}

async function postMilestone(req, res) {
  try {
    const { name, project_id, projectId, value } = req.body || {};
    if (!name || !(project_id || projectId)) {
      return res.status(400).json({ error: 'name and project_id are required' });
    }
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'value is required' });
    }

    const milestone = await createMilestone(req.body);
    const response = {
      id: String(milestone._id),
      name: milestone.name,
      project_id: milestone.project ? String(milestone.project) : null,
      value: milestone.value,
      due_date: milestone.dueDate,
      status: milestone.status,
      description: milestone.description,
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ error: error.message || 'Failed to create milestone' });
  }
}

async function putMilestone(req, res) {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid milestone id is required' });
    }

    const milestone = await updateMilestone(id, req.body);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    const response = {
      id: String(milestone._id),
      name: milestone.name,
      project_id: milestone.project ? String(milestone.project) : null,
      value: milestone.value,
      due_date: milestone.dueDate,
      status: milestone.status,
      description: milestone.description,
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: error.message || 'Failed to update milestone' });
  }
}

async function deleteMilestoneHandler(req, res) {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid milestone id is required' });
    }

    const milestone = await deleteMilestone(id);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ error: error.message || 'Failed to delete milestone' });
  }
}

module.exports = {
  getMilestones,
  postMilestone,
  putMilestone,
  deleteMilestoneHandler,
};

