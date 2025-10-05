-- Users
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  displayName VARCHAR(255) NOT NULL,
  avatarUrl VARCHAR(1024) DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Conversations (1-1 / group)
CREATE TABLE conversations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  type ENUM('direct','group') NOT NULL DEFAULT 'direct',
  title VARCHAR(255) DEFAULT NULL,
  avatarUrl VARCHAR(1024) DEFAULT NULL,     -- ảnh đại diện group
  coverGifUrl VARCHAR(1024) DEFAULT NULL,   -- gif/banner
  label ENUM('Chill','Work','Gaming','Study','Team','Family','Custom') DEFAULT 'Custom',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Members
CREATE TABLE conversation_members (
  conversationId BIGINT UNSIGNED NOT NULL,
  userId BIGINT UNSIGNED NOT NULL,
  role ENUM('member','admin') DEFAULT 'member',
  joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversationId, userId),
  INDEX idx_member_user (userId),
  INDEX idx_member_conv (conversationId),
  CONSTRAINT fk_members_conv
    FOREIGN KEY (conversationId) REFERENCES conversations(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_members_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messages
CREATE TABLE messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  conversationId BIGINT UNSIGNED NOT NULL,
  senderId BIGINT UNSIGNED NOT NULL,
  content TEXT,  -- lưu ciphertext/base64 nếu E2EE
  contentType ENUM('text','image','file','system') DEFAULT 'text',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editedAt DATETIME DEFAULT NULL ,
  INDEX idx_conv_created (conversationId, createdAt),
  INDEX idx_conv_id (conversationId, id),
  CONSTRAINT fk_messages_conv
    FOREIGN KEY (conversationId) REFERENCES conversations(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_messages_user
    FOREIGN KEY (senderId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Read receipts
CREATE TABLE message_receipts (
  messageId BIGINT UNSIGNED NOT NULL,
  userId BIGINT UNSIGNED NOT NULL,
  status ENUM('delivered','read') NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (messageId, userId),
  INDEX idx_receipts_user (userId),
  CONSTRAINT fk_receipts_message
    FOREIGN KEY (messageId) REFERENCES messages(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_receipts_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
