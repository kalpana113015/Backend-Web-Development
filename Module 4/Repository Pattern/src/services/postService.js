const postRepository = require('../repositories/postRepository');

function listPosts() {
  return postRepository.findAll();
}

function getPost(id) {
  return postRepository.findById(id);
}

function createPost(fields) {
  // Business validation rule remains in the service layer
  if (!fields || !fields.title || !fields.title.trim()) {
    const error = new Error('Title is required');
    error.statusCode = 422;
    throw error;
  }

  return postRepository.create({
    title: fields.title.trim(),
    body: fields.body || '',
    authorId: fields.authorId,
  });
}

function updatePost(id, patch) {
  return postRepository.update(id, patch);
}

function removePost(id) {
  return postRepository.remove(id);
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  removePost,
};
