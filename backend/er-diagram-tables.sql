-- ============================================================================
-- ADD2CART - E-COMMERCE WEBSITE
-- DATABASE SCHEMA DDL SCRIPT (Based on ER Diagram)
-- Target Database: MySQL / MariaDB
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `add2cart_detailed`;
USE `add2cart_detailed`;

-- Disable foreign key checks temporarily to drop tables in any order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `wishlist`;
DROP TABLE IF EXISTS `review`;
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `order_item`;
DROP TABLE IF EXISTS `order`;
DROP TABLE IF EXISTS `cart_item`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `payment_method`;
DROP TABLE IF EXISTS `address`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `user`;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USER TABLE
-- ============================================================================
CREATE TABLE `user` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `gender` VARCHAR(15) DEFAULT NULL,
    `date_of_birth` DATE DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 2. CATEGORY TABLE
-- ============================================================================
CREATE TABLE `category` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. PRODUCT TABLE
-- ============================================================================
CREATE TABLE `product` (
    `product_id` VARCHAR(50) PRIMARY KEY,
    `category_id` INT NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(5, 2) DEFAULT 0.00,
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `image_url` LONGTEXT NOT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_product_category` 
        FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 4. ADDRESS TABLE
-- ============================================================================
CREATE TABLE `address` (
    `address_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'Shipping', -- e.g., 'Shipping', 'Billing'
    `address_line1` VARCHAR(255) NOT NULL,
    `address_line2` VARCHAR(255) DEFAULT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `is_default` TINYINT(1) DEFAULT 0,
    CONSTRAINT `fk_address_user` 
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 5. PAYMENT_METHOD TABLE
-- ============================================================================
CREATE TABLE `payment_method` (
    `payment_method_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `card_holder_name` VARCHAR(255) DEFAULT NULL,
    `card_number` VARCHAR(30) DEFAULT NULL,
    `expiry_date` VARCHAR(10) DEFAULT NULL,
    `cvv` VARCHAR(4) DEFAULT NULL,
    `type` VARCHAR(50) NOT NULL, -- e.g., 'Card', 'UPI', 'Wallet', 'NetBanking'
    `is_default` TINYINT(1) DEFAULT 0,
    CONSTRAINT `fk_payment_method_user` 
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 6. CART TABLE (1:1 Relationship with User)
-- ============================================================================
CREATE TABLE `cart` (
    `cart_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE, -- Unique constraint ensures 1:1 cardinality
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cart_user` 
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 7. CART_ITEM TABLE (N:M Associative Table between Cart and Product)
-- ============================================================================
CREATE TABLE `cart_item` (
    `cart_item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `cart_id` INT NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_cart_product` (`cart_id`, `product_id`), -- Prevents duplicate lines
    CONSTRAINT `fk_cart_item_cart` 
        FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_cart_item_product` 
        FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 8. ORDER TABLE
-- ============================================================================
CREATE TABLE `order` (
    `order_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `address_id` INT NOT NULL,
    `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `order_status` VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Shipped', 'Delivered', 'Cancelled'
    `total_amount` DECIMAL(10, 2) NOT NULL,
    CONSTRAINT `fk_order_user` 
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_order_address` 
        FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 9. ORDER_ITEM TABLE (N:M Associative Table between Order and Product)
-- ============================================================================
CREATE TABLE `order_item` (
    `order_item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL, -- Price locked at time of order
    `discount` DECIMAL(5, 2) DEFAULT 0.00,
    CONSTRAINT `fk_order_item_order` 
        FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_order_item_product` 
        FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 10. PAYMENT TABLE
-- ============================================================================
CREATE TABLE `payment` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `payment_method_id` INT DEFAULT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Success', 'Failed', 'Pending'
    `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `transaction_id` VARCHAR(100) UNIQUE DEFAULT NULL,
    CONSTRAINT `fk_payment_order` 
        FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_payment_method` 
        FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method` (`payment_method_id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 11. REVIEW TABLE
-- ============================================================================
CREATE TABLE `review` (
    `review_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `rating` INT NOT NULL, -- E.g., 1 to 5 scale
    `comment` TEXT DEFAULT NULL,
    `review_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_review_rating` CHECK (`rating` BETWEEN 1 AND 5),
    CONSTRAINT `fk_review_user` 
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_review_product` 
        FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 12. WISHLIST TABLE (N:M Associative Table between User and Product)
-- ============================================================================
CREATE TABLE `wishlist` (
    `wishlist_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_wishlist` (`user_id`, `product_id`),
    CONSTRAINT `fk_wishlist_user` 
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_wishlist_product` 
        FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
