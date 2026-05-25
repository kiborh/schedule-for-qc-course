/**
 * Task 2.1: CRUD integration tests for the Group resource (primary resource).
 * Task 2.3: DB verification tests (steps 4 and 10).
 *
 * Group fields: id, title, disable, sortOrder.
 * Group DELETE is a hard delete (row removed from DB).
 *
 * Requires a running backend at API_URL (default: http://localhost:8080)
 * and a reachable PostgreSQL instance (see DB_* env vars or .env).
 *
 * Run: npm test -- --testPathPattern=groups
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const axios = require('axios');
const { Pool } = require('pg');

const BASE_URL = process.env.API_URL || 'http://localhost:8080';
const TOKEN_PREFIX = 'Bearer_';

const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5433', 10),
    database: process.env.DB_NAME     || 'appdb',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

// Shared state across ordered tests
let authHeader;
let createdGroupId;
let createdGroupTitle;

/** Issue an HTTP request; never throws on 4xx/5xx — returns the response. */
async function api(method, path, data) {
    return axios({
        method,
        url: `${BASE_URL}${path}`,
        data,
        headers: {
            Authorization: authHeader,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        validateStatus: () => true,
    });
}

// ---------------------------------------------------------------------------
// Suite setup / teardown
// ---------------------------------------------------------------------------

beforeAll(async () => {
    // Authenticate
    const res = await axios.post(
        `${BASE_URL}/auth/sign-in`,
        { email: process.env.ADMIN_EMAIL || 'manager@gmail.com', password: process.env.ADMIN_PASSWORD || 'Qwerty!123' },
        { validateStatus: () => true },
    );
    expect(res.status).toBe(200);
    authHeader = `${TOKEN_PREFIX}${res.data.token}`;

    // Truncate relevant tables to start from a clean state
    try {
        await pool.query('TRUNCATE lessons, semester_group, groups RESTART IDENTITY CASCADE');
    } catch (err) {
        throw new Error(
            `DB connection failed. Check .env (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD).\nOriginal: ${err.message}`
        );
    }
});

afterAll(async () => {
    await pool.end();
});

// ---------------------------------------------------------------------------
// Step 1: GET all — 200, JSON array
// ---------------------------------------------------------------------------

test('GET /groups - should return 200 and a JSON array', async () => {
    const res = await api('GET', '/groups');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
});

// ---------------------------------------------------------------------------
// Step 2: GET all with seeded data — check required fields
// ---------------------------------------------------------------------------

test('GET /groups - each item must have id and title when list is non-empty', async () => {
    // Seed via API to ensure the group is visible through the application layer
    const seedRes = await api('POST', '/groups', {
        title: `FieldCheck_Group_${Date.now()}`,
        disable: false,
    });
    const seedId = seedRes.data.id;

    const res = await api('GET', '/groups');

    expect(res.status).toBe(200);
    expect(res.data[0]).toHaveProperty('id');
    expect(res.data[0]).toHaveProperty('title');

    await api('DELETE', `/groups/${seedId}`);
});

// ---------------------------------------------------------------------------
// Step 3: POST create — 201 + save id for subsequent tests
// ---------------------------------------------------------------------------

test('POST /groups - should create group and return 201 with id', async () => {
    createdGroupTitle = `TestGroup_${Date.now()}`;

    const res = await api('POST', '/groups', { title: createdGroupTitle, disable: false });

    expect(res.status).toBe(201);
    expect(res.data.id).toBeTruthy();
    expect(res.data.title).toBe(createdGroupTitle);
    expect(res.data.disable).toBe(false);

    createdGroupId = res.data.id;
});

// ---------------------------------------------------------------------------
// Step 4 (Task 2.3): DB verification — row must exist after POST
// ---------------------------------------------------------------------------

test('DB: group created via POST must be persisted in the database', async () => {
    expect(createdGroupId).toBeTruthy();

    const result = await pool.query('SELECT * FROM groups WHERE id = $1', [createdGroupId]);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].title).toBe(createdGroupTitle);
    expect(result.rows[0].disable).toBe(false);
});

// ---------------------------------------------------------------------------
// Step 5: GET by ID — 200 with correct data
// ---------------------------------------------------------------------------

test('GET /groups/{id} - should return 200 with the correct group', async () => {
    expect(createdGroupId).toBeTruthy();

    const res = await api('GET', `/groups/${createdGroupId}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(createdGroupId);
    expect(res.data.title).toBe(createdGroupTitle);
});

// ---------------------------------------------------------------------------
// Step 6 (negative): GET non-existing — 404
// ---------------------------------------------------------------------------

test('GET /groups/999999 - should return 404 for non-existing id (negative)', async () => {
    const res = await api('GET', '/groups/999999');

    expect(res.status).toBe(404);
});

// ---------------------------------------------------------------------------
// Step 7 (negative): POST with empty title — 400
// ---------------------------------------------------------------------------

test('POST /groups with empty title - should return 400 (negative)', async () => {
    const res = await api('POST', '/groups', { title: '', disable: false });

    expect(res.status).toBe(400);
});

// ---------------------------------------------------------------------------
// Step 8: PUT update — 200 with updated title
// ---------------------------------------------------------------------------

test('PUT /groups - should update group title and return 200', async () => {
    expect(createdGroupId).toBeTruthy();

    const updatedTitle = `Updated_${Date.now()}`;

    const res = await api('PUT', '/groups', { id: createdGroupId, title: updatedTitle, disable: false });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(createdGroupId);
    expect(res.data.title).toBe(updatedTitle);

    createdGroupTitle = updatedTitle;
});

// ---------------------------------------------------------------------------
// Step 9: DELETE — 200/204
// ---------------------------------------------------------------------------

test('DELETE /groups/{id} - should delete group and return 200/204', async () => {
    expect(createdGroupId).toBeTruthy();

    const res = await api('DELETE', `/groups/${createdGroupId}`);

    expect([200, 204]).toContain(res.status);
});

// ---------------------------------------------------------------------------
// Step 10: GET after DELETE — 404
// ---------------------------------------------------------------------------

test('GET /groups/{id} after DELETE - should return 404', async () => {
    expect(createdGroupId).toBeTruthy();

    const res = await api('GET', `/groups/${createdGroupId}`);

    expect(res.status).toBe(404);
});

// ---------------------------------------------------------------------------
// Step 11 (Task 2.3): DB verification — row must be gone after DELETE
// ---------------------------------------------------------------------------

test('DB: group deleted via DELETE must no longer exist in the database', async () => {
    expect(createdGroupId).toBeTruthy();

    const result = await pool.query('SELECT * FROM groups WHERE id = $1', [createdGroupId]);

    expect(result.rows).toHaveLength(0);
});
