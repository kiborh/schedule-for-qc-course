/**
 * Task 2.2: Integration tests for the Semester resource (additional resource).
 * Task 2.3: DB verification tests (steps 4 and 11).
 *
 * Semester is an "additional" resource: it references Period via ManyToMany
 * (semester_period table).  Since fillDefaultValues() fetches available periods
 * from DB (and can return empty set), semesters can be created with
 * semester_classes: [] — @NotNull on periods allows an empty Set.
 * Semester DELETE is a hard delete (row removed from DB).
 *
 * Date format used by API: "dd/MM/yyyy" (e.g. "01/09/2026").
 * Negative test for invalid dates: endDay before startDay → 400.
 *
 * Requires a running backend at API_URL (default: http://localhost:8081)
 * and a reachable PostgreSQL instance (see DB_* env vars or .env).
 *
 * Run: npm test -- --testPathPattern=semesters
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
let createdSemesterId;
let createdDescription;

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
        await pool.query(
            'TRUNCATE semester_period, semester_group, semester_day, schedules, lessons, semesters RESTART IDENTITY CASCADE',
        );
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

test('GET /semesters - should return 200 and a JSON array', async () => {
    const res = await api('GET', '/semesters');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
});

// ---------------------------------------------------------------------------
// Step 2: GET all with seeded data — check required fields
// ---------------------------------------------------------------------------

test('GET /semesters - each item must have id, description, year when non-empty', async () => {
    // Seed via API so the semester has all required associations and appears in GET
    const seedRes = await api('POST', '/semesters', {
        description: `FieldCheck_Sem_${Date.now()}`,
        year: 2025,
        startDay: '01/02/2025',
        endDay: '30/06/2025',
        currentSemester: false,
        defaultSemester: false,
        semester_days: ['MONDAY'],
        semester_classes: [],
        semester_groups: [],
    });
    const seedId = seedRes.data.id;

    const res = await api('GET', '/semesters');

    expect(res.status).toBe(200);
    expect(res.data[0]).toHaveProperty('id');
    expect(res.data[0]).toHaveProperty('description');
    expect(res.data[0]).toHaveProperty('year');

    await api('DELETE', `/semesters/${seedId}`);
});

// ---------------------------------------------------------------------------
// Step 3: POST create — 201 + save id for subsequent tests
// ---------------------------------------------------------------------------

test('POST /semesters - should create semester and return 201 with id', async () => {
    createdDescription = `Semester_${Date.now()}`;

    const body = {
        description: createdDescription,
        year: 2026,
        startDay: '01/09/2026',
        endDay: '31/12/2026',
        currentSemester: false,
        defaultSemester: false,
        semester_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        semester_classes: [],
        semester_groups: [],
    };

    const res = await api('POST', '/semesters', body);

    expect(res.status).toBe(201);
    expect(res.data.id).toBeTruthy();
    expect(res.data.description).toBe(createdDescription);
    expect(res.data.year).toBe(2026);

    createdSemesterId = res.data.id;
});

// ---------------------------------------------------------------------------
// Step 4 (Task 2.3): DB verification — row must exist after POST
// ---------------------------------------------------------------------------

test('DB: semester created via POST must be persisted in the database', async () => {
    expect(createdSemesterId).toBeTruthy();

    const result = await pool.query('SELECT * FROM semesters WHERE id = $1', [createdSemesterId]);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].description).toBe(createdDescription);
    expect(result.rows[0].year).toBe(2026);
});

// ---------------------------------------------------------------------------
// Step 5: GET by ID — 200 with all key fields
// ---------------------------------------------------------------------------

test('GET /semesters/{id} - should return 200 with the correct semester', async () => {
    expect(createdSemesterId).toBeTruthy();

    const res = await api('GET', `/semesters/${createdSemesterId}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(createdSemesterId);
    expect(res.data.description).toBe(createdDescription);
    expect(res.data.year).toBe(2026);
});

// ---------------------------------------------------------------------------
// Step 6 (negative): GET non-existing — 404
// ---------------------------------------------------------------------------

test('GET /semesters/999999 - should return 404 for non-existing id (negative)', async () => {
    const res = await api('GET', '/semesters/999999');

    expect(res.status).toBe(404);
});

// ---------------------------------------------------------------------------
// Step 7 (negative): POST with endDay before startDay — 400
// ---------------------------------------------------------------------------

test('POST /semesters with endDay before startDay - should return 400 (negative)', async () => {
    const body = {
        description: `Invalid_${Date.now()}`,
        year: 2026,
        startDay: '01/12/2026',
        endDay: '01/09/2026',
        currentSemester: false,
        defaultSemester: false,
        semester_days: ['MONDAY', 'TUESDAY'],
        semester_classes: [],
        semester_groups: [],
    };

    const res = await api('POST', '/semesters', body);

    expect(res.status).toBe(400);
});

// ---------------------------------------------------------------------------
// Step 8: PUT update — 200 with updated description
// ---------------------------------------------------------------------------

test('PUT /semesters - should update semester description and return 200', async () => {
    expect(createdSemesterId).toBeTruthy();

    const updatedDescription = `Updated_Semester_${Date.now()}`;

    const body = {
        id: createdSemesterId,
        description: updatedDescription,
        year: 2026,
        startDay: '01/09/2026',
        endDay: '31/12/2026',
        currentSemester: false,
        defaultSemester: false,
        semester_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        semester_classes: [],
        semester_groups: [],
    };

    const res = await api('PUT', '/semesters', body);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(createdSemesterId);
    expect(res.data.description).toBe(updatedDescription);

    createdDescription = updatedDescription;
});

// ---------------------------------------------------------------------------
// Step 9: DELETE — 200/204
// ---------------------------------------------------------------------------

test('DELETE /semesters/{id} - should delete semester and return 200/204', async () => {
    expect(createdSemesterId).toBeTruthy();

    const res = await api('DELETE', `/semesters/${createdSemesterId}`);

    expect([200, 204]).toContain(res.status);
});

// ---------------------------------------------------------------------------
// Step 10: GET after DELETE — 404
// ---------------------------------------------------------------------------

test('GET /semesters/{id} after DELETE - should return 404', async () => {
    expect(createdSemesterId).toBeTruthy();

    const res = await api('GET', `/semesters/${createdSemesterId}`);

    expect(res.status).toBe(404);
});

// ---------------------------------------------------------------------------
// Step 11 (Task 2.3): DB verification — row must be gone after DELETE
// ---------------------------------------------------------------------------

test('DB: semester deleted via DELETE must no longer exist in the database', async () => {
    expect(createdSemesterId).toBeTruthy();

    const result = await pool.query('SELECT * FROM semesters WHERE id = $1', [createdSemesterId]);

    expect(result.rows).toHaveLength(0);
});
