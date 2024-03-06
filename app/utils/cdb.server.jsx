import pkg from 'pg';
const { Pool } = pkg;
const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.CERT
    }
};

const db = new Pool(config);

export default db;

