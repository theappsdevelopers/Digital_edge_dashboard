const { getModel } = require('../../config/requestContext');

async function listProjects() {
  const Project = getModel('Project');
  return Project.find({}).lean();
}

/**
 * Create project. Body: name, client_id, total_value, start_date, end_date, status, description, notes (snake_case).
 */
async function createProject(body) {
  const Project = getModel('Project');
  const doc = {
    name: body.name,
    client: body.client_id,
    totalValue: body.total_value,
    startDate: body.start_date || body.startDate,
    endDate: body.end_date || body.endDate,
    status: body.status ?? 'Not Started',
    description: body.description,
    notes: body.notes,
  };
  const project = await Project.create(doc);
  return project.toObject();
}

/**
 * Update project by id. Same body shape as create (snake_case).
 */
async function updateProject(id, body) {
  const Project = getModel('Project');
  const update = {
    name: body.name,
    client: body.client_id,
    totalValue: body.total_value,
    startDate: body.start_date || body.startDate,
    endDate: body.end_date || body.endDate,
    status: body.status ?? 'Not Started',
    description: body.description,
    notes: body.notes,
  };
  const project = await Project.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  return project;
}

async function deleteProject(id) {
  const Project = getModel('Project');
  const project = await Project.findByIdAndDelete(id);
  return project;
}

module.exports = {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
};

