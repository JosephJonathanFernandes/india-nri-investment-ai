import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { config } from './config';

export type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtAccessExpiry as SignOptions['expiresIn'],
    issuer: 'nri-investment-simplifier',
    audience: 'nri-investment-simplifier',
  };
  return jwt.sign(payload, config.jwtAccessSecret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiry as SignOptions['expiresIn'],
    issuer: 'nri-investment-simplifier',
    audience: 'nri-investment-simplifier',
  };
  return jwt.sign(payload, config.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const options: VerifyOptions = {
      issuer: 'nri-investment-simplifier',
      audience: 'nri-investment-simplifier',
    };
    return jwt.verify(token, config.jwtAccessSecret, options) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const options: VerifyOptions = {
      issuer: 'nri-investment-simplifier',
      audience: 'nri-investment-simplifier',
    };
    return jwt.verify(token, config.jwtRefreshSecret, options) as TokenPayload;
  } catch {
    return null;
  }
}
