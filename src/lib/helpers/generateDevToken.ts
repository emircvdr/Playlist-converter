import jwt from "jsonwebtoken";
import { createPrivateKey } from "crypto";

let cached: { token: string; exp: number } | null = null;

function getPemFromEnv(): string {
  const b64 = process.env.APPLE_PRIVATE_KEY_B64;
  const raw = process.env.APPLE_PRIVATE_KEY;

  if (b64) {
    const pem = Buffer.from(b64, "base64").toString("utf8");
    return pem;
  }
  if (raw) {
    return raw.replace(/\\n/g, "\n");
  }
  throw new Error("APPLE_PRIVATE_KEY_B64 veya APPLE_PRIVATE_KEY bulunamadı");
}

function validatePem(pem: string) {
  const trimmed = pem.trim();
  if (
    !trimmed.startsWith("-----BEGIN PRIVATE KEY-----") ||
    !trimmed.endsWith("-----END PRIVATE KEY-----")
  ) {
    throw new Error("PEM header/footer eksik");
  }

  const keyObj = createPrivateKey({ key: pem, format: "pem", type: "pkcs8" });

  if (keyObj.asymmetricKeyType !== "ec") {
    throw new Error(`Key EC değil: ${keyObj.asymmetricKeyType}`);
  }
}

export function generateAppleDeveloperToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;

  const TEAM_ID = process.env.APPLE_TEAM_ID!;
  const KEY_ID = process.env.APPLE_KEY_ID!;
  const PRIVATE_PEM = getPemFromEnv();

  validatePem(PRIVATE_PEM);

  const exp = now + 60 * 60 * 24 * 90; // expire in 90 days
  const token = jwt.sign({}, PRIVATE_PEM, {
    algorithm: "ES256",
    issuer: TEAM_ID,
    header: { kid: KEY_ID, alg: "ES256" },
    expiresIn: exp - now,
  });

  cached = { token, exp };
  return token;
}
