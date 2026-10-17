import jwt from 'jsonwebtoken'

export type TokenPayload = { sub: string }

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is missing or too short. Check server/.env')
  }
  return secret
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getSecret(), {
    expiresIn: SEVEN_DAYS_IN_SECONDS,
  })
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getSecret())
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Invalid token')
  }
  return { sub: decoded.sub }
}