/**
 * My2KBuilder share-codec v1 — contract section 4.4 ("编码 URL，零存储").
 *
 * Frame layout (binary before base64url):
 *   byte 0      : format version (0x01)
 *   bytes 1..n  : UTF-8 compact JSON payload
 *
 * Payload wire form (compact JSON array, no whitespace):
 *   [position, heightIn, disciplinePriority[6], badges[[badgeIndex, slots]...], blueprintRef | -1]
 *
 * Hard rules (contract section 4.4):
 *   - encode/decode run 100% client-side; no server read/write of share state.
 *   - encoded id (URL path segment of /b/[id]) must be <= MAX_ID_LENGTH (2048) chars.
 *   - version byte enables future format evolution; unknown versions decode-fail
 *     with ERR_VERSION (client shows the "version not supported" dead state).
 *   - zero storage: nothing here touches KV/D1/network.
 *
 * Runtime-neutral: only Uint8Array + TextEncoder/TextDecoder (browser, Workers,
 * Node 18+). No atob/btoa, no Node Buffer.
 */

export const SHARE_CODEC_VERSION = 1;
export const MAX_ID_LENGTH = 2048;

export const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;
export const DISCIPLINE_COUNT = 6;
export const MAX_BADGE_SLOTS = 20;
export const BADGE_INDEX_MAX = 52; // 53 officially confirmed badges (0..52)
export const BLUEPRINT_INDEX_MAX = 39; // 40 officially confirmed blueprints (0..39)
export const HEIGHT_IN_MIN = 60;
export const HEIGHT_IN_MAX = 96;

export interface PlannerStateV1 {
  /** index into POSITIONS */
  position: number;
  /** height in inches */
  heightIn: number;
  /** rank per discipline index; exactly 6 integers, each 0..5, all distinct */
  disciplinePriority: number[];
  /** [badgeIndex, slotsAllocated] pairs; at most 20 entries, total slots <= 20 */
  badges: Array<[number, number]>;
  /** optional source blueprint index (0..39); -1 / undefined = none */
  blueprintRef?: number;
}

export type DecodeErrorKind = "ERR_LENGTH" | "ERR_FORMAT" | "ERR_VERSION" | "ERR_SEMANTIC";

export interface CodecError {
  kind: DecodeErrorKind;
  message: string;
}

export type EncodeResult = { ok: true; id: string } | { ok: false; error: CodecError };
export type DecodeResult = { ok: true; state: PlannerStateV1 } | { ok: false; error: CodecError };

const B64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const B64URL_RE = /^[A-Za-z0-9\-_]+$/;

function bytesToBase64Url(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64URL_ALPHABET[b0 >> 2];
    out += B64URL_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    if (i + 1 < bytes.length) out += B64URL_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)];
    if (i + 2 < bytes.length) out += B64URL_ALPHABET[b2 & 0x3f];
  }
  return out;
}

function base64UrlToBytes(s: string): Uint8Array | null {
  if (s.length === 0 || !B64URL_RE.test(s)) return null;
  if (s.length % 4 === 1) return null; // impossible base64 length
  const lookup = new Map<string, number>();
  for (let i = 0; i < B64URL_ALPHABET.length; i++) lookup.set(B64URL_ALPHABET[i], i);
  const out: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    const c0 = lookup.get(s[i])!;
    const c1 = i + 1 < s.length ? lookup.get(s[i + 1])! : 0;
    const c2 = i + 2 < s.length ? lookup.get(s[i + 2])! : 0;
    const c3 = i + 3 < s.length ? lookup.get(s[i + 3])! : 0;
    out.push((c0 << 2) | (c1 >> 4));
    if (i + 2 < s.length) out.push(((c1 & 0x0f) << 4) | (c2 >> 2));
    if (i + 3 < s.length) out.push(((c2 & 0x03) << 6) | c3);
  }
  return new Uint8Array(out);
}

function err(kind: DecodeErrorKind, message: string): CodecError {
  return { kind, message };
}

/** Semantic validation shared by encode (defensive) and decode. */
function validateState(raw: unknown): PlannerStateV1 | CodecError {
  if (!Array.isArray(raw) || raw.length < 4 || raw.length > 5) {
    return err("ERR_FORMAT", "payload must be an array of 4..5 elements");
  }
  const [position, heightIn, disciplinePriority, badges, blueprintRef] = raw as unknown[];

  if (!Number.isInteger(position) || (position as number) < 0 || (position as number) >= POSITIONS.length) {
    return err("ERR_SEMANTIC", "position out of range");
  }
  if (
    !Number.isInteger(heightIn) ||
    (heightIn as number) < HEIGHT_IN_MIN ||
    (heightIn as number) > HEIGHT_IN_MAX
  ) {
    return err("ERR_SEMANTIC", "heightIn out of range");
  }
  if (
    !Array.isArray(disciplinePriority) ||
    disciplinePriority.length !== DISCIPLINE_COUNT ||
    !disciplinePriority.every((d) => Number.isInteger(d) && (d as number) >= 0 && (d as number) < DISCIPLINE_COUNT) ||
    new Set(disciplinePriority as number[]).size !== DISCIPLINE_COUNT
  ) {
    return err("ERR_SEMANTIC", "disciplinePriority must be a permutation of 0..5");
  }
  if (!Array.isArray(badges) || badges.length > MAX_BADGE_SLOTS) {
    return err("ERR_SEMANTIC", "badges must be an array of at most 20 entries");
  }
  let totalSlots = 0;
  const seenBadges = new Set<number>();
  for (const pair of badges as unknown[]) {
    if (!Array.isArray(pair) || pair.length !== 2) {
      return err("ERR_SEMANTIC", "each badge entry must be [badgeIndex, slots]");
    }
    const [b, s] = pair as unknown[];
    if (!Number.isInteger(b) || (b as number) < 0 || (b as number) > BADGE_INDEX_MAX) {
      return err("ERR_SEMANTIC", "badgeIndex out of range");
    }
    if (!Number.isInteger(s) || (s as number) < 1 || (s as number) > MAX_BADGE_SLOTS) {
      return err("ERR_SEMANTIC", "badge slots out of range");
    }
    if (seenBadges.has(b as number)) {
      return err("ERR_SEMANTIC", "duplicate badgeIndex");
    }
    seenBadges.add(b as number);
    totalSlots += s as number;
  }
  if (totalSlots > MAX_BADGE_SLOTS) {
    return err("ERR_SEMANTIC", "total badge slots exceed 20");
  }
  const bp = blueprintRef === undefined ? -1 : blueprintRef;
  if (!Number.isInteger(bp) || (bp as number) < -1 || (bp as number) > BLUEPRINT_INDEX_MAX) {
    return err("ERR_SEMANTIC", "blueprintRef out of range");
  }

  return {
    position: position as number,
    heightIn: heightIn as number,
    disciplinePriority: disciplinePriority as number[],
    badges: badges as Array<[number, number]>,
    blueprintRef: bp as number,
  };
}

function toWire(state: PlannerStateV1): unknown[] {
  return [
    state.position,
    state.heightIn,
    state.disciplinePriority,
    state.badges,
    state.blueprintRef === undefined ? -1 : state.blueprintRef,
  ];
}

export function encode(state: PlannerStateV1): EncodeResult {
  const validated = validateState(toWire(state));
  if ("kind" in validated) return { ok: false, error: validated };
  const payload = new TextEncoder().encode(JSON.stringify(toWire(validated)));
  const frame = new Uint8Array(1 + payload.length);
  frame[0] = SHARE_CODEC_VERSION;
  frame.set(payload, 1);
  const id = bytesToBase64Url(frame);
  if (id.length > MAX_ID_LENGTH) {
    return { ok: false, error: err("ERR_LENGTH", `encoded id ${id.length} chars > ${MAX_ID_LENGTH}`) };
  }
  return { ok: true, id };
}

export function decode(id: string): DecodeResult {
  if (id.length > MAX_ID_LENGTH) {
    return { ok: false, error: err("ERR_LENGTH", `id ${id.length} chars > ${MAX_ID_LENGTH}`) };
  }
  const bytes = base64UrlToBytes(id);
  if (bytes === null || bytes.length < 2) {
    return { ok: false, error: err("ERR_FORMAT", "not a valid base64url frame") };
  }
  if (bytes[0] !== SHARE_CODEC_VERSION) {
    return {
      ok: false,
      error: err("ERR_VERSION", `unsupported share format version ${bytes[0]} (supported: ${SHARE_CODEC_VERSION})`),
    };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(bytes.subarray(1)));
  } catch {
    return { ok: false, error: err("ERR_FORMAT", "payload is not valid UTF-8 JSON") };
  }
  const validated = validateState(raw);
  if ("kind" in validated) return { ok: false, error: validated };
  return { ok: true, state: validated };
}
