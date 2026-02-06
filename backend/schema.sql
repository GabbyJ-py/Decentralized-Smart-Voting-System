-- Database: voter_db
CREATE DATABASE IF NOT EXISTS voter_db;
USE voter_db;

-- Table for Voter Metadata (Strictly metadata, NOT votes)
CREATE TABLE registered_voter (
    id INT AUTO_INCREMENT PRIMARY KEY,

    voter_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male','Female','Other') NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    aadhaar VARCHAR(20) UNIQUE NOT NULL,

    photo_path VARCHAR(255) NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE NOT NULL,
    
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for faster queries
    INDEX idx_voter_id (voter_id),
    INDEX idx_aadhaar (aadhaar),
    INDEX idx_email (email),
    INDEX idx_has_voted (has_voted)
);


-- Note: Votes are stored on the Ethereum Blockchain, not in this MySQL table.