// lib/database-safe.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Safe database operations that don't fail during build
export async function safeDatabaseOperation(operation) {
  try {
    return await operation(prisma);
  } catch (error) {
    console.warn('Database connection failed during build:', error.message);
    return null; // Return null for failed operations
  }
}

// Safe query functions
export async function safeFindMany(model, options = {}) {
  try {
    return await prisma[model].findMany(options);
  } catch (error) {
    console.warn(`Database query failed for ${model}:`, error.message);
    return []; // Return empty array for failed queries
  }
}

export async function safeFindUnique(model, options) {
  try {
    return await prisma[model].findUnique(options);
  } catch (error) {
    console.warn(`Database query failed for ${model}:`, error.message);
    return null; // Return null for failed queries
  }
}

export async function safeCount(model, options = {}) {
  try {
    return await prisma[model].count(options);
  } catch (error) {
    console.warn(`Database count failed for ${model}:`, error.message);
    return 0; // Return 0 for failed counts
  }
}

export { prisma };


