#!/usr/bin/env node
// scripts/cleanup-orphaned-images.js
// Script to find and optionally delete orphaned images from Cloudinary

import 'dotenv/config';
import mongoose from 'mongoose';
import Fabric from '../models/Fabric.js';
import Post from '../models/Post.js';
import { getOrphanedImages, deleteCloudinaryImages } from '../utils/cloudinary.js';

const DRY_RUN = process.argv.includes('--dry-run');
const FOLDER = process.argv.find(arg => arg.startsWith('--folder='))?.split('=')[1];
const DELETE_OLD = process.argv.find(arg => arg.startsWith('--delete-old='))?.split('=')[1];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function getUsedImagePublicIds() {
  console.log('📊 Scanning database for used images...\n');
  
  // Get all fabric images
  const fabrics = await Fabric.find({}, 'imagesMeta').lean();
  const fabricImageIds = fabrics.flatMap(f => 
    (f.imagesMeta || []).map(m => m.public_id).filter(Boolean)
  );
  console.log(`   Found ${fabricImageIds.length} images in ${fabrics.length} fabrics`);

  // Get all post images
  const posts = await Post.find({}, 'imagesMeta').lean();
  const postImageIds = posts.flatMap(p => 
    (p.imagesMeta || []).map(m => m.public_id).filter(Boolean)
  );
  console.log(`   Found ${postImageIds.length} images in ${posts.length} posts`);

  const allUsedIds = new Set([...fabricImageIds, ...postImageIds]);
  console.log(`\n📊 Total unique images in database: ${allUsedIds.size}\n`);
  
  return allUsedIds;
}

async function findOrphanedImages(folder) {
  console.log(`🔍 Scanning Cloudinary folder: ${folder}\n`);
  
  const cloudinaryImages = await getOrphanedImages(folder);
  console.log(`   Found ${cloudinaryImages.length} images in Cloudinary`);
  
  const usedIds = await getUsedImagePublicIds();
  
  const orphaned = cloudinaryImages.filter(img => !usedIds.has(img.public_id));
  
  console.log(`\n🗑️  Orphaned images: ${orphaned.length}\n`);
  
  if (orphaned.length > 0) {
    const totalSize = orphaned.reduce((sum, img) => sum + img.bytes, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    console.log(`💾 Total size: ${totalSizeMB} MB\n`);
    console.log('Orphaned images:');
    orphaned.forEach(img => {
      const sizeMB = (img.bytes / 1024 / 1024).toFixed(2);
      const date = new Date(img.created_at).toLocaleDateString();
      console.log(`   - ${img.public_id} (${sizeMB} MB, created: ${date})`);
    });
  }
  
  return orphaned;
}

async function deleteOrphanedImages(orphaned) {
  if (orphaned.length === 0) {
    console.log('\n✅ No orphaned images to delete!');
    return;
  }

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No images will be deleted');
    console.log(`   Would delete ${orphaned.length} orphaned images`);
    return;
  }

  console.log(`\n⚠️  DELETING ${orphaned.length} orphaned images...\n`);
  
  const publicIds = orphaned.map(img => img.public_id);
  const result = await deleteCloudinaryImages(publicIds);
  
  console.log(`\n✅ Deleted ${result.successful} images`);
  if (result.failed > 0) {
    console.log(`❌ Failed to delete ${result.failed} images`);
    
    const failures = result.results.filter(r => !r.success);
    console.log('\nFailed deletions:');
    failures.forEach(f => {
      console.log(`   - ${f.publicId}: ${f.error}`);
    });
  }
}

async function main() {
  console.log('\n🧹 Cloudinary Orphaned Images Cleanup Script\n');
  console.log('='.repeat(50));
  console.log('');

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not found in environment variables');
    process.exit(1);
  }

  if (!process.env.CLOUDINARY_NAME) {
    console.error('❌ Cloudinary credentials not found in environment variables');
    process.exit(1);
  }

  await connectDB();

  const foldersToCheck = FOLDER 
    ? [FOLDER] 
    : ['adaayen/fabrics', 'adaayen/posts'];

  let totalOrphaned = [];

  for (const folder of foldersToCheck) {
    console.log(`\n${'='.repeat(50)}`);
    const orphaned = await findOrphanedImages(folder);
    totalOrphaned = totalOrphaned.concat(orphaned);
  }

  console.log(`\n${'='.repeat(50)}\n`);
  console.log(`📊 SUMMARY`);
  console.log(`   Total orphaned images across all folders: ${totalOrphaned.length}\n`);

  if (totalOrphaned.length > 0) {
    await deleteOrphanedImages(totalOrphaned);
  }

  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  console.log('\n✨ Cleanup complete!\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Usage instructions
if (process.argv.includes('--help')) {
  console.log(`
Usage: node scripts/cleanup-orphaned-images.js [options]

Options:
  --dry-run              Run without deleting (preview mode)
  --folder=<path>        Check specific folder (e.g., adaayen/fabrics)
  --help                 Show this help message

Examples:
  # Preview orphaned images
  node scripts/cleanup-orphaned-images.js --dry-run

  # Delete orphaned images from all folders
  node scripts/cleanup-orphaned-images.js

  # Check specific folder
  node scripts/cleanup-orphaned-images.js --folder=adaayen/fabrics --dry-run

  # Delete orphaned images from specific folder
  node scripts/cleanup-orphaned-images.js --folder=adaayen/posts
  `);
  process.exit(0);
}
