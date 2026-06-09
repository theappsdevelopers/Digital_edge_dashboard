const { getModel } = require('../../config/requestContext');

async function listMilestones() {
  const Milestone = getModel('Milestone');
  return Milestone.find({}).lean();
}

/**
 * Create milestone.
 * Body: name, due_date/dueDate, project_id/projectId, value, status, description, completed (ignored – derived from status).
 */
async function createMilestone(body) {
  const Milestone = getModel('Milestone');
  const doc = {
    name: body.name,
    project: body.project_id || body.projectId,
    value: body.value,
    dueDate: body.due_date || body.dueDate,
    status: body.status || 'Pending',
    description: body.description,
  };
  const milestone = await Milestone.create(doc);
  return milestone.toObject();
}

async function updateMilestone(id, body) {
  const Milestone = getModel('Milestone');
  const updateDoc = {};
  if (body.name !== undefined) updateDoc.name = body.name;
  if (body.project_id !== undefined || body.projectId !== undefined) {
    updateDoc.project = body.project_id || body.projectId;
  }
  if (body.value !== undefined) updateDoc.value = body.value;
  if (body.due_date !== undefined || body.dueDate !== undefined) {
    updateDoc.dueDate = body.due_date || body.dueDate;
  }
  if (body.status !== undefined) updateDoc.status = body.status;
  if (body.description !== undefined) updateDoc.description = body.description;
  if (body.completed !== undefined) {
    updateDoc.status = body.completed ? 'Completed' : 'Pending';
  }
  
  const milestone = await Milestone.findByIdAndUpdate(id, updateDoc, { new: true });
  return milestone ? milestone.toObject() : null;
}

async function deleteMilestone(id) {
  const Milestone = getModel('Milestone');
  const milestone = await Milestone.findByIdAndDelete(id);
  return milestone ? milestone.toObject() : null;
}

module.exports = {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};

