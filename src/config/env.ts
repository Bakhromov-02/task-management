import dotenv from 'dotenv';
dotenv.config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  BCRYPT_ROUNDS: number;
}

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "8000", 10),
  MONGODB_URI: process.env.MONGODB_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "1h",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
};

export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';