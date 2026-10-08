// Faux client Supabase en mémoire, pour développer sans backend ni connexion.
// Activé uniquement avec VITE_MOCK_BACKEND=true (voir .env.development).
import { MOCK_USER_ID, seed } from './seed';

type Row = Record<string, any>;
type Filter = (r: Row) => boolean;

const DB_KEY = 'mock-db-v1';
const AUTH_KEY = 'mock-auth-signed-out';

const load = (): Record<string, Row[]> => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return JSON.parse(JSON.stringify(seed));
};
let db = load();
const save = () => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* ignore */ } };
(window as any).resetMockDb = () => { localStorage.removeItem(DB_KEY); location.reload(); };

const uuid = () => (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const cmp = (a: any, b: any) => (a == null ? -1 : b == null ? 1 : a < b ? -1 : a > b ? 1 : 0);
const likeToRegex = (p: string) =>
  new RegExp('^' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');

const parseVal = (v: string): any => (v === 'null' ? null : v === 'true' ? true : v === 'false' ? false : v);

const opFilter = (col: string, op: string, val: any): Filter => {
  switch (op) {
    case 'eq': return r => r[col] == val;
    case 'neq': return r => r[col] != val;
    case 'gt': return r => r[col] > val;
    case 'gte': return r => r[col] >= val;
    case 'lt': return r => r[col] < val;
    case 'lte': return r => r[col] <= val;
    case 'is': return r => r[col] === val || (val === null && r[col] == null);
    case 'in': return r => (Array.isArray(val) ? val : String(val).replace(/[()]/g, '').split(',')).includes(r[col]);
    case 'like':
    case 'ilike': return r => likeToRegex(String(val)).test(String(r[col] ?? ''));
    case 'contains': return r => Array.isArray(r[col]) && (val as any[]).every(x => r[col].includes(x));
    default: return () => true;
  }
};

class Query implements PromiseLike<any> {
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private filters: Filter[] = [];
  private orders: Array<{ col: string; asc: boolean }> = [];
  private limitN: number | null = null;
  private payload: any = null;
  private wantRows = false;
  private mode: 'many' | 'single' | 'maybe' = 'many';
  private head = false;
  private count = false;

  constructor(private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (this.op === 'select') this.wantRows = true;
    else this.wantRows = true;
    if (opts?.count) this.count = true;
    if (opts?.head) this.head = true;
    return this;
  }
  insert(p: any) { this.op = 'insert'; this.payload = p; return this; }
  update(p: any) { this.op = 'update'; this.payload = p; return this; }
  upsert(p: any) { this.op = 'upsert'; this.payload = p; return this; }
  delete() { this.op = 'delete'; return this; }

  eq(c: string, v: any) { this.filters.push(opFilter(c, 'eq', v)); return this; }
  neq(c: string, v: any) { this.filters.push(opFilter(c, 'neq', v)); return this; }
  gt(c: string, v: any) { this.filters.push(opFilter(c, 'gt', v)); return this; }
  gte(c: string, v: any) { this.filters.push(opFilter(c, 'gte', v)); return this; }
  lt(c: string, v: any) { this.filters.push(opFilter(c, 'lt', v)); return this; }
  lte(c: string, v: any) { this.filters.push(opFilter(c, 'lte', v)); return this; }
  is(c: string, v: any) { this.filters.push(opFilter(c, 'is', v)); return this; }
  in(c: string, v: any[]) { this.filters.push(opFilter(c, 'in', v)); return this; }
  like(c: string, v: string) { this.filters.push(opFilter(c, 'like', v)); return this; }
  ilike(c: string, v: string) { this.filters.push(opFilter(c, 'ilike', v)); return this; }
  contains(c: string, v: any) { this.filters.push(opFilter(c, 'contains', v)); return this; }
  match(o: Row) { Object.entries(o).forEach(([k, v]) => this.eq(k, v)); return this; }
  not(c: string, op: string, v: any) { const f = opFilter(c, op, v); this.filters.push(r => !f(r)); return this; }
  filter(c: string, op: string, v: any) { this.filters.push(opFilter(c, op, v)); return this; }
  or(expr: string) {
    const fs = expr.split(',').map(part => {
      const [c, op, ...rest] = part.split('.');
      return opFilter(c, op, parseVal(rest.join('.')));
    });
    this.filters.push(r => fs.some(f => f(r)));
    return this;
  }
  order(c: string, o?: { ascending?: boolean }) { this.orders.push({ col: c, asc: o?.ascending !== false }); return this; }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) { this.limitN = to - from + 1; return this; }
  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybe'; return this; }

  private run() {
    const rows = (db[this.table] ||= []);
    const ts = new Date().toISOString();
    let result: Row[] = [];

    if (this.op === 'insert' || this.op === 'upsert') {
      const items = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((p: Row) => ({
        id: uuid(), created_at: ts, updated_at: ts, ...p,
      }));
      items.forEach((it: Row) => {
        const i = this.op === 'upsert' ? rows.findIndex(r => r.id === it.id) : -1;
        if (i >= 0) rows[i] = { ...rows[i], ...it, updated_at: ts };
        else rows.push(it);
      });
      result = items;
      save();
    } else if (this.op === 'update') {
      rows.forEach((r, i) => {
        if (this.filters.every(f => f(r))) {
          rows[i] = { ...r, ...this.payload, updated_at: ts };
          result.push(rows[i]);
        }
      });
      save();
    } else if (this.op === 'delete') {
      db[this.table] = rows.filter(r => {
        const hit = this.filters.every(f => f(r));
        if (hit) result.push(r);
        return !hit;
      });
      save();
    } else {
      result = rows.filter(r => this.filters.every(f => f(r)));
    }

    this.orders.slice().reverse().forEach(({ col, asc }) =>
      result.sort((a, b) => (asc ? 1 : -1) * cmp(a[col], b[col])));
    if (this.limitN != null) result = result.slice(0, this.limitN);
    result = result.map(r => ({ ...r }));

    const count = this.count ? result.length : null;
    if (this.head) return { data: null, error: null, count };
    if (this.op !== 'select' && !this.wantRows) return { data: null, error: null, count };
    if (this.mode === 'single') {
      return result.length === 1
        ? { data: result[0], error: null, count }
        : { data: null, error: { code: 'PGRST116', message: 'No single row found' }, count };
    }
    if (this.mode === 'maybe') return { data: result[0] ?? null, error: null, count };
    return { data: result, error: null, count };
  }

  then<R1 = any, R2 = never>(
    onfulfilled?: ((v: any) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((e: any) => R2 | PromiseLike<R2>) | null,
  ) {
    return Promise.resolve().then(() => this.run()).then(onfulfilled, onrejected);
  }
}

// --- Auth factice : admin connecté par défaut, une connexion avec n'importe quels identifiants fonctionne.
const fakeUser = (email = 'admin@demo.local') => ({
  id: MOCK_USER_ID, email, aud: 'authenticated', role: 'authenticated',
  app_metadata: {}, user_metadata: { first_name: 'Admin', last_name: 'Démo' },
  created_at: new Date().toISOString(),
});
const fakeSession = (email?: string) => ({
  access_token: 'mock', refresh_token: 'mock', token_type: 'bearer', expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600, user: fakeUser(email),
});
const isSignedOut = () => { try { return localStorage.getItem(AUTH_KEY) === '1'; } catch { return false; } };
const setSignedOut = (v: boolean) => { try { v ? localStorage.setItem(AUTH_KEY, '1') : localStorage.removeItem(AUTH_KEY); } catch { /* ignore */ } };
const listeners = new Set<(e: string, s: any) => void>();
const emit = (e: string, s: any) => listeners.forEach(l => l(e, s));

const auth = {
  async getSession() { return { data: { session: isSignedOut() ? null : fakeSession() }, error: null }; },
  async getUser() { return { data: { user: isSignedOut() ? null : fakeUser() }, error: null }; },
  onAuthStateChange(cb: (e: string, s: any) => void) {
    listeners.add(cb);
    setTimeout(() => cb('INITIAL_SESSION', isSignedOut() ? null : fakeSession()), 0);
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },
  async signInWithPassword({ email }: { email: string }) {
    setSignedOut(false); const s = fakeSession(email); emit('SIGNED_IN', s);
    return { data: { user: s.user, session: s }, error: null };
  },
  async signUp({ email }: { email: string }) {
    setSignedOut(false); const s = fakeSession(email); emit('SIGNED_IN', s);
    return { data: { user: s.user, session: s }, error: null };
  },
  async signOut() { setSignedOut(true); emit('SIGNED_OUT', null); return { error: null }; },
  async resetPasswordForEmail() { return { data: {}, error: null }; },
  async updateUser() { return { data: { user: fakeUser() }, error: null }; },
};

const storage = {
  from: (_bucket: string) => ({
    async upload(path: string) { return { data: { path }, error: null }; },
    async remove() { return { data: [], error: null }; },
    async list() { return { data: [], error: null }; },
    async download() { return { data: new Blob(), error: null }; },
    async createSignedUrl(path: string) { return { data: { signedUrl: `about:blank#${path}` }, error: null }; },
    getPublicUrl: (path: string) => ({ data: { publicUrl: `https://placehold.co/600x400?text=${encodeURIComponent(path.split('/').pop() || 'fichier')}` } }),
  }),
};

const channelStub: any = { on() { return channelStub; }, subscribe() { return channelStub; }, unsubscribe() { return Promise.resolve('ok'); } };

export const createMockClient = () => ({
  from: (table: string) => new Query(table),
  rpc: async (name: string) => {
    if (name === 'people_public_fn' || name === 'get_people_detailed') return { data: [...(db.people || [])], error: null };
    return { data: [], error: null };
  },
  auth,
  storage,
  functions: { invoke: async (name: string) => { console.info(`[mock] functions.invoke('${name}') ignoré`); return { data: {}, error: null }; } },
  channel: () => channelStub,
  removeChannel: async () => 'ok',
});
