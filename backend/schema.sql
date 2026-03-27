-- SkillLedger Database Schema
-- Create this database and run this script to set up all tables

CREATE DATABASE IF NOT EXISTS skill_ledger
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skill_ledger;

-- Users table for SIWE authentication
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(42) NOT NULL UNIQUE,
  nonce VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_address (address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resumes table stores resume data + IPFS CID
CREATE TABLE IF NOT EXISTS resumes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_address VARCHAR(42) NOT NULL,
  original_filename VARCHAR(255),
  extracted_text TEXT,
  features_json JSON,
  encrypted_ipfs_cid VARCHAR(100),
  encrypted_ipfs_cid_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_address),
  INDEX idx_cid_hash (encrypted_ipfs_cid_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scores table stores ML analysis results
CREATE TABLE IF NOT EXISTS scores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_address VARCHAR(42) NOT NULL,
  resume_id INT UNSIGNED NOT NULL,
  ml_score DECIMAL(5,2),
  fraud_prob DECIMAL(5,3),
  final_score DECIMAL(5,2),
  explanation_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_address),
  INDEX idx_resume (resume_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Credential index - synced from blockchain events
CREATE TABLE IF NOT EXISTS credential_index (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token_id VARCHAR(100) NOT NULL UNIQUE,
  learner VARCHAR(42) NOT NULL,
  issuer VARCHAR(42) NOT NULL,
  credential_hash VARCHAR(66),
  issued_at BIGINT UNSIGNED,
  revoked TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_learner (learner),
  INDEX idx_issuer (issuer),
  INDEX idx_token (token_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
