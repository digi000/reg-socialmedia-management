import db from './database';

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');

    // Create managers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS managers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Managers table created');

    // Create employees table
    await db.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        position VARCHAR(255),
        manager_id UUID REFERENCES managers(id) ON DELETE SET NULL,
        social_username VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
        approved_at TIMESTAMP,
        approved_by UUID REFERENCES managers(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Employees table created');

    // Create social_accounts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS social_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'facebook')),
        platform_user_id VARCHAR(255) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        username VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_synced TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Social accounts table created');

    // Create tagged_posts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tagged_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        platform_post_id VARCHAR(255) NOT NULL,
        platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'facebook')),
        post_url TEXT NOT NULL,
        content TEXT,
        media_type VARCHAR(50),
        tagged_at TIMESTAMP NOT NULL,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        post_owner VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tagged posts table created');

    // Create indexes for better performance
    await db.query(`CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_managers_email ON managers(email);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_tagged_posts_employee_id ON tagged_posts(employee_id);`);
    console.log('✅ Indexes created');

    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
