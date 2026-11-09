/**
 * Future Migration Note: Transitioning to Prisma ORM
 * 
 * WHAT WILL REMAIN UNCHANGED:
 * 1. Interface / Method Signatures: The standard repository contracts (findAll, findById, create, update, remove)
 *    will remain the stable boundary between the service layer and data persistence.
 * 2. Service Layer Decoupling: Services (postService.js) and controllers (postController.js) will continue to speak
 *    only in domain language and will not leak database details. Domain validation rules (e.g. required title)
 *    remain strictly in the service layer.
 * 3. Return Semantics & Data Shapes: The methods will continue returning plain record objects, null for missing
 *    records, and boolean values for removal status.
 *
 * WHAT WILL CHANGE:
 * 1. Storage Mechanism: The in-memory Map (`posts`) and manual ID counter (`nextId`) will be replaced
 *    by the Prisma Client instance (e.g. `prisma.post`).
 * 2. Asynchronous Operations: Database I/O is inherently asynchronous, so repository methods will return
 *    Promises using `await prisma.post.findMany()`, `findUnique()`, `create()`, `update()`, and `delete()`.
 *    The calling services will accordingly await these calls.
 * 3. ID Generation: Primary key generation will be delegated to the database schema (e.g. autoincrement() or cuid()).
 * 4. Error Handling: Prisma-specific errors (such as P2025 record not found on update/delete) will be caught
 *    and mapped to null or false to preserve existing contract behavior.
 */

// Private in-memory storage seeded with initial records (Map-backed storage)
const posts = new Map([
  [1, { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 }],
  [2, { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 }],
]);

let nextId = 3;

/**
 * Returns defensive copies of all records in a new array.
 * @returns {Array<Object>}
 */
function findAll() {
  return Array.from(posts.values()).map((post) => ({ ...post }));
}

/**
 * Returns a defensive copy of the found record or null.
 * @param {number|string} id 
 * @returns {Object|null}
 */
function findById(id) {
  const numericId = Number(id);
  const post = posts.get(numericId);
  return post ? { ...post } : null;
}

/**
 * Generates repository-owned ID and creates a new record.
 * @param {Object} fields 
 * @returns {Object} Complete created record
 */
function create({ title, body = '', authorId }) {
  const newPost = {
    id: nextId++,
    title,
    body,
    authorId,
  };
  posts.set(newPost.id, { ...newPost });
  return { ...newPost };
}

/**
 * Updates only editable fields; preserves immutable id and authorId.
 * Returns updated copy or null if not found.
 * @param {number|string} id 
 * @param {Object} patch 
 * @returns {Object|null}
 */
function update(id, patch) {
  const numericId = Number(id);
  const post = posts.get(numericId);
  if (!post) return null;

  const updatedPost = { ...post };
  if (patch.title !== undefined) updatedPost.title = patch.title;
  if (patch.body !== undefined) updatedPost.body = patch.body;

  posts.set(numericId, updatedPost);
  return { ...updatedPost };
}

/**
 * Deletes the record; returns boolean status (true if deleted, false if not found).
 * @param {number|string} id 
 * @returns {boolean}
 */
function remove(id) {
  const numericId = Number(id);
  return posts.delete(numericId);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
