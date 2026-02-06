# Database Migrations

This folder contains SQL migration scripts to update your existing database.

## How to Run Migrations

### Option 1: MySQL Command Line
```bash
mysql -u root -p < migrations/001_add_has_voted_column.sql
```

### Option 2: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open the migration file: `File > Open SQL Script`
4. Execute the script: Click the lightning bolt icon

### Option 3: Direct Command
```bash
mysql -u root -p voter_db < migrations/001_add_has_voted_column.sql
```

## Migration History

- **001_add_has_voted_column.sql** - Adds `has_voted` column and performance indexes
  - Adds `has_voted BOOLEAN DEFAULT FALSE`
  - Adds `registration_date TIMESTAMP`
  - Creates indexes on frequently queried columns
