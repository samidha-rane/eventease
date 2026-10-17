import 'dotenv/config'
import pg from 'pg'

const url = process.env.DATABASE_URL

if (!url) {
  console.error('DATABASE_URL is missing. Check server/.env')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: url })

try {
  const result = await pool.query(
    'select now() as time, current_database() as db',
  )
  console.log('Database connected:', result.rows[0])
} catch (error) {
  console.error('Could not connect:', (error as Error).message)
  process.exitCode = 1
} finally {
  await pool.end()
}