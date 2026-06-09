const { getCollections, ObjectId } = require('./approvals.db');

function toUserDto(doc) {
  return {
    id: doc._id.toString(),
    username: doc.username,
    role: doc.role,
  };
}

async function getInitData() {
  const { users } = await getCollections();
  const allUsers = await users
    .find({}, { projection: { username: 1, role: 1 } })
    .toArray();

  const userDtos = allUsers.map(toUserDto);
  const approvers = userDtos.filter((u) => u.role === 'approver');

  return {
    users: userDtos,
    approvers,
  };
}

async function signup({ username, password, role }) {
  if (!username || !password || !role) {
    return {
      status: 400,
      body: { error: 'username, password and role are required' },
    };
  }

  const { users } = await getCollections();

  const existing = await users.findOne({ username });
  if (existing) {
    return {
      status: 400,
      body: {
        error: 'Username already taken. Please try logging in instead.',
      },
    };
  }

  const insertResult = await users.insertOne({ username, password, role });
  const userId = insertResult.insertedId.toString();

  const { users: allUsers, approvers } = await getInitData();

  return {
    status: 200,
    body: {
      user: {
        id: userId,
        username,
        role,
      },
      users: allUsers,
      approvers,
    },
  };
}

async function login({ username, password }) {
  if (!username || !password) {
    return {
      status: 400,
      body: { error: 'username and password are required' },
    };
  }

  const { users } = await getCollections();
  const user = await users.findOne({ username, password });

  if (!user) {
    return {
      status: 401,
      body: { error: 'Invalid credentials' },
    };
  }

  const { users: allUsers, approvers } = await getInitData();

  return {
    status: 200,
    body: {
      user: toUserDto(user),
      users: allUsers,
      approvers,
    },
  };
}

async function reset() {
  const { users, requests, requestApprovals } = await getCollections();
  await Promise.all([
    users.deleteMany({}),
    requests.deleteMany({}),
    requestApprovals.deleteMany({}),
  ]);

  return {
    status: 200,
    body: { message: 'Database reset successful' },
  };
}

async function listUsers() {
  const { users } = await getCollections();
  const docs = await users
    .find({}, { projection: { username: 1, role: 1 } })
    .toArray();
  return docs.map(toUserDto);
}

async function listApprovers() {
  const { users } = await getCollections();
  const docs = await users
    .find({ role: 'approver' }, { projection: { username: 1, role: 1 } })
    .toArray();
  return docs.map(toUserDto);
}

async function buildFullRequest(requestId) {
  const { requests, requestApprovals, users } = await getCollections();

  const reqObjectId = typeof requestId === 'string' ? new ObjectId(requestId) : requestId;

  const requestDoc = await requests.findOne({ _id: reqObjectId });
  if (!requestDoc) return null;

  const approvalsDocs = await requestApprovals
    .find({ requestId: reqObjectId })
    .toArray();

  const userIds = new Set();
  userIds.add(requestDoc.requesterId.toString());
  approvalsDocs.forEach((a) => {
    userIds.add(a.approverId.toString());
  });

  const userObjectIds = Array.from(userIds).map((id) => new ObjectId(id));
  const userDocs = await users
    .find({ _id: { $in: userObjectIds } }, { projection: { username: 1, role: 1 } })
    .toArray();

  const userMap = new Map(
    userDocs.map((u) => [u._id.toString(), u.username]),
  );

  const approvals = approvalsDocs.map((a) => ({
    id: a._id.toString(),
    request_id: a.requestId.toString(),
    approver_id: a.approverId.toString(),
    approver_name: userMap.get(a.approverId.toString()) || 'Unknown',
    status: a.status,
  }));

  return {
    id: requestDoc._id.toString(),
    requester_id: requestDoc.requesterId.toString(),
    requester_name: userMap.get(requestDoc.requesterId.toString()) || 'Unknown',
    title: requestDoc.title,
    description: requestDoc.description,
    request_type: requestDoc.requestType || null,
    start_date: requestDoc.startDate || null,
    end_date: requestDoc.endDate || null,
    status: requestDoc.status,
    created_at: requestDoc.createdAt
      ? requestDoc.createdAt.toISOString()
      : new Date().toISOString(),
    approvals,
  };
}

async function getRequests({ role, userId }) {
  if (!role || !userId) {
    return {
      status: 400,
      body: { error: 'role and userId are required' },
    };
  }

  const { requests, requestApprovals, users } = await getCollections();
  const userObjectId = new ObjectId(userId);

  let requestDocs;

  if (role === 'approver') {
    const approvalsForApprover = await requestApprovals
      .find({ approverId: userObjectId })
      .toArray();
    const requestIds = [...new Set(approvalsForApprover.map((a) => a.requestId.toString()))];
    const requestObjectIds = requestIds.map((id) => new ObjectId(id));

    requestDocs = await requests
      .find({ _id: { $in: requestObjectIds } })
      .sort({ createdAt: -1 })
      .toArray();
  } else {
    requestDocs = await requests
      .find({ requesterId: userObjectId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  if (!requestDocs.length) {
    return {
      status: 200,
      body: [],
    };
  }

  const requestIds = requestDocs.map((r) => r._id);
  const approvalsDocs = await requestApprovals
    .find({ requestId: { $in: requestIds } })
    .toArray();

  const userIds = new Set();
  requestDocs.forEach((r) => {
    userIds.add(r.requesterId.toString());
  });
  approvalsDocs.forEach((a) => {
    userIds.add(a.approverId.toString());
  });

  const userObjectIds = Array.from(userIds).map((id) => new ObjectId(id));
  const userDocs = await users
    .find({ _id: { $in: userObjectIds } }, { projection: { username: 1, role: 1 } })
    .toArray();

  const userMap = new Map(userDocs.map((u) => [u._id.toString(), u.username]));

  const approvalsByRequestId = new Map();
  approvalsDocs.forEach((a) => {
    const key = a.requestId.toString();
    if (!approvalsByRequestId.has(key)) approvalsByRequestId.set(key, []);
    approvalsByRequestId.get(key).push(a);
  });

  const result = requestDocs.map((r) => {
    const approvals = (approvalsByRequestId.get(r._id.toString()) || []).map((a) => ({
      id: a._id.toString(),
      request_id: a.requestId.toString(),
      approver_id: a.approverId.toString(),
      approver_name: userMap.get(a.approverId.toString()) || 'Unknown',
      status: a.status,
    }));

    let myStatus;
    if (role === 'approver') {
      const myApproval = approvals.find((a) => a.approver_id === userId);
      myStatus = myApproval ? myApproval.status : undefined;
    }

    return {
      id: r._id.toString(),
      requester_id: r.requesterId.toString(),
      requester_name: userMap.get(r.requesterId.toString()) || 'Unknown',
      title: r.title,
      description: r.description,
      request_type: r.requestType || null,
      start_date: r.startDate || null,
      end_date: r.endDate || null,
      status: r.status,
      created_at: r.createdAt
        ? r.createdAt.toISOString()
        : new Date().toISOString(),
      approvals,
      my_status: myStatus,
    };
  });

  return {
    status: 200,
    body: result,
  };
}

async function createRequest(
  { requester_id, title, description, approver_ids, request_type, start_date, end_date },
  io,
) {
  if (!requester_id || !title || !description || !approver_ids || !approver_ids.length) {
    return {
      status: 400,
      body: { error: 'requester_id, title, description and approver_ids are required' },
    };
  }

  const { requests, requestApprovals } = await getCollections();
  const requesterId = new ObjectId(requester_id);
  const approverObjectIds = approver_ids.map((id) => new ObjectId(id));

  const now = new Date();

  const requestInsert = await requests.insertOne({
    requesterId,
    title,
    description,
    requestType: request_type || null,
    startDate: start_date || null,
    endDate: end_date || null,
    status: 'pending',
    createdAt: now,
  });

  const requestId = requestInsert.insertedId;

  const approvalsDocs = approverObjectIds.map((approverId) => ({
    requestId,
    approverId,
    status: 'pending',
    updatedAt: now,
  }));

  if (approvalsDocs.length) {
    await requestApprovals.insertMany(approvalsDocs);
  }

  const fullRequest = await buildFullRequest(requestId);

  if (io && typeof io.emit === 'function') {
    io.emit('request_created', fullRequest);
  }

  return {
    status: 200,
    body: fullRequest,
  };
}

async function cancelRequest({ id, userId }, io) {
  if (!id || !userId) {
    return {
      status: 400,
      body: { error: 'id and userId are required' },
    };
  }

  const { requests } = await getCollections();
  const requestId = new ObjectId(id);
  const userObjectId = new ObjectId(userId);

  const requestDoc = await requests.findOne({ _id: requestId });
  if (!requestDoc || requestDoc.requesterId.toString() !== userId) {
    return {
      status: 403,
      body: { error: 'Unauthorized' },
    };
  }

  await requests.updateOne(
    { _id: requestId },
    { $set: { status: 'cancelled' } },
  );

  const fullRequest = await buildFullRequest(requestId);

  if (io && typeof io.emit === 'function') {
    io.emit('request_updated', fullRequest);
  }

  return {
    status: 200,
    body: fullRequest,
  };
}

async function approveRequest({ id, approverId, status }, io) {
  if (!id || !approverId || !status) {
    return {
      status: 400,
      body: { error: 'id, approverId and status are required' },
    };
  }

  const { requests, requestApprovals } = await getCollections();
  const requestId = new ObjectId(id);
  const approverObjectId = new ObjectId(approverId);

  await requestApprovals.updateOne(
    { requestId, approverId: approverObjectId },
    { $set: { status, updatedAt: new Date() } },
  );

  const approvalsDocs = await requestApprovals
    .find({ requestId })
    .toArray();

  let finalStatus = 'pending';
  if (approvalsDocs.some((a) => a.status === 'rejected')) {
    finalStatus = 'rejected';
  } else if (approvalsDocs.length > 0 && approvalsDocs.every((a) => a.status === 'approved')) {
    finalStatus = 'approved';
  }

  if (finalStatus !== 'pending') {
    await requests.updateOne(
      { _id: requestId },
      { $set: { status: finalStatus } },
    );
  }

  const fullRequest = await buildFullRequest(requestId);

  if (io && typeof io.emit === 'function') {
    io.emit('request_updated', fullRequest);
  }

  return {
    status: 200,
    body: fullRequest,
  };
}

module.exports = {
  signup,
  login,
  reset,
  listUsers,
  listApprovers,
  getRequests,
  createRequest,
  cancelRequest,
  approveRequest,
};

