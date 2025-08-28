/*
Verification script: registers two users, logs in, creates an event, lists events, books event, lists bookings.
Requires backend running locally and accessible at BASE (default http://localhost:5002/api).
*/

const BASE = process.env.BASE || 'http://localhost:5002/api';

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const e = new Error(`HTTP ${res.status}`);
    e.status = res.status;
    e.data = data;
    throw e;
  }
  return data;
}

(async () => {
  const uniq = Date.now();
  const emailA = `verifier.a+${uniq}@example.com`;
  const emailB = `verifier.b+${uniq}@example.com`;
  console.log('Using emails:', { emailA, emailB, BASE });

  try {
    // Register A
    const regA = await jsonFetch(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Verifier A', email: emailA, password: 'Password123' }),
    });
    console.log('\nREGISTER A:', { user: regA.user });
    const tokenA = regA.token;

    // Register B
    const regB = await jsonFetch(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Verifier B', email: emailB, password: 'Password123' }),
    });
    console.log('\nREGISTER B:', { user: regB.user });

    // Login B
    const loginB = await jsonFetch(`${BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: emailB, password: 'Password123' }),
    });
    console.log('\nLOGIN B:', { user: loginB.user });
    const tokenB = loginB.token;

    // Create Event with A
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const createEvent = await jsonFetch(`${BASE}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Verification Event',
        description: 'Automated end-to-end test event',
        date: futureDate,
        location: 'Test City',
        capacity: 25,
        images: [],
      }),
    });
    console.log('\nCREATE EVENT:', { id: createEvent._id || createEvent.id, title: createEvent.title });

    // List events
    const events = await jsonFetch(`${BASE}/events`);
    console.log('\nLIST EVENTS count:', Array.isArray(events) ? events.length : 'N/A');

    // Book event with B
    const eventId = createEvent._id || createEvent.id;
    const booking = await jsonFetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ eventId, seats: 2 }),
    });
    console.log('\nBOOK EVENT (B):', { id: booking._id || booking.id, seats: booking.seats, status: booking.status });

    // B's bookings
    const myBookings = await jsonFetch(`${BASE}/bookings/me`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('\nB BOOKINGS (summary):', myBookings.map(b => ({ id: b._id, event: b.event?.title, seats: b.seats, status: b.status })));

    console.log('\nVERIFICATION: SUCCESS');
  } catch (e) {
    console.error('\nVERIFICATION: FAILED', { status: e.status, data: e.data, message: e.message });
    process.exit(1);
  }
})();

