import { config as dotenvConfig } from 'dotenv';
import path from 'path';

// Load environment variables
dotenvConfig();

interface Config {
  port: number;
  nodeEnv: string;
  supabase: {
    url: string;
    key: string;
  };
  jwt: {
    secret: string;
  };
  client: {
    url: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

if (config.nodeEnv !== 'test') {
  validateConfig();
}

export default config;

