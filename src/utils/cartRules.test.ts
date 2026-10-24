import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateShipping,
  applyCoupon,
  calculateOrderTotals,
  validateIndianPinCode,
  validateIndianPhone,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE
} from './cartRules';
import { CartItem } from '../types';

const sampleItems: CartItem[] = [
  {
    id: 'item-1',
    productId: 'prod-1',
    name: 'Floral Kurti Set',
    price: 1299,
    originalPrice: 1599,
    image: '',
    color: 'Lavender',
    size: 'M',
    quantity: 2,
    category: 'Kurtis'
  },
  {
    id: 'item-2',
    productId: 'prod-2',
    name: 'Casual Top',
    price: 899,
    originalPrice: 1099,
    image: '',
    color: 'Sage',
    size: 'S',
    quantity: 1,
    category: 'Tops'
  }
];

test('calculateSubtotal correctly aggregates line items', () => {
  const subtotal = calculateSubtotal(sampleItems);
  assert.equal(subtotal, 1299 * 2 + 899); // 2598 + 899 = 3497
});

test('calculateShipping waives fee above threshold and charges below threshold', () => {
  assert.equal(calculateShipping(FREE_SHIPPING_THRESHOLD), 0);
  assert.equal(calculateShipping(FREE_SHIPPING_THRESHOLD + 100), 0);
  assert.equal(calculateShipping(500), STANDARD_SHIPPING_FEE);
  assert.equal(calculateShipping(0), 0);
});

test('applyCoupon calculates percentage and flat discounts correctly', () => {
  const percentResult = applyCoupon(2000, 'STYL10');
  assert.equal(percentResult.isValid, true);
  assert.equal(percentResult.discount, 200);

  const flatResult = applyCoupon(3000, 'WELCOME500');
  assert.equal(flatResult.isValid, true);
  assert.equal(flatResult.discount, 500);

  const invalidResult = applyCoupon(1000, 'FAKECODE');
  assert.equal(invalidResult.isValid, false);
  assert.equal(invalidResult.discount, 0);

  const minSpendResult = applyCoupon(1000, 'WELCOME500');
  assert.equal(minSpendResult.isValid, false);
});

test('calculateOrderTotals outputs valid summary and progress', () => {
  const totals = calculateOrderTotals(sampleItems, 'STYL10');
  assert.equal(totals.subtotal, 3497);
  assert.equal(totals.discount, 350); // 10% of 3497 rounded
  assert.equal(totals.shipping, 0); // 3497 - 350 = 3147 >= 999
  assert.equal(totals.total, 3497 - 350);
  assert.equal(totals.freeShippingDifference, 0);
  assert.equal(totals.freeShippingProgress, 100);
});

test('validateIndianPinCode accepts valid 6-digit PIN codes and rejects invalid ones', () => {
  assert.equal(validateIndianPinCode('560001'), true);
  assert.equal(validateIndianPinCode('110001'), true);
  assert.equal(validateIndianPinCode('012345'), false); // Cannot start with 0
  assert.equal(validateIndianPinCode('56000'), false); // Too short
  assert.equal(validateIndianPinCode('5600019'), false); // Too long
  assert.equal(validateIndianPinCode('56000A'), false);
});

test('validateIndianPhone validates 10-digit mobile numbers', () => {
  assert.equal(validateIndianPhone('9876543210'), true);
  assert.equal(validateIndianPhone('+91 9876543210'), true);
  assert.equal(validateIndianPhone('5876543210'), false); // Must start with 6,7,8,9
  assert.equal(validateIndianPhone('12345'), false);
});
