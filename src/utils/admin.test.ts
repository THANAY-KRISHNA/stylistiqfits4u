import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBytes, scaleDimensions } from '../lib/imageOptimizer';
import { slugify } from '../lib/adminData';
import { isAdminUser } from '../lib/auth';

test('formatBytes formats bytes correctly into B, KB, MB', () => {
  assert.equal(formatBytes(500), '500 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(1024 * 1024), '1.00 MB');
  assert.equal(formatBytes(2.5 * 1024 * 1024), '2.50 MB');
});

test('scaleDimensions scales down proportionally without upscaling', () => {
  // Should not upscale smaller images
  assert.deepEqual(scaleDimensions(800, 600, 1200, 1600), { width: 800, height: 600 });
  // Should scale down maintaining aspect ratio
  assert.deepEqual(scaleDimensions(2400, 1800, 1200, 1600), { width: 1200, height: 900 });
  assert.deepEqual(scaleDimensions(2000, 4000, 1200, 1600), { width: 800, height: 1600 });
});

test('slugify transforms strings into URL-safe slugs', () => {
  assert.equal(slugify('Floral Kurti Set'), 'floral-kurti-set');
  assert.equal(slugify('Chanderi Silk Saree @2026!'), 'chanderi-silk-saree-2026');
  assert.equal(slugify('  Extra   Spaces  Here  '), 'extra-spaces-here');
  assert.equal(slugify('Special--Dashes__Mix'), 'special-dashes-mix');
});

test('isAdminUser correctly matches admin email', () => {
  assert.equal(isAdminUser(null), false);
  assert.equal(isAdminUser({ email: 'other@example.com' } as any), false);
  assert.equal(isAdminUser({ email: 'stylistiqfits4u@gmail.com' } as any), true);
  assert.equal(isAdminUser({ email: 'STYLISTIQFITS4U@GMAIL.COM' } as any), true);
});
