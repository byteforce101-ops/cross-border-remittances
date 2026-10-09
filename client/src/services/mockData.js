/**
 * client/src/services/mockData.js
 * Central mock data for demo transactions, recipients, route stats.
 */

import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';
import { CORRIDORS } from '@shared/constants/corridors.js';

export { CORRIDORS };

export const DEMO_TRANSACTIONS = [
  {
    id: 'CBR-2026-001241', date: '2026-10-08T10:32:00Z',
    senderName: 'Arjun Patel', senderCountry: 'UAE', senderCurrency: 'AED',
    recipientName: 'Priya Sharma', recipientUpi: 'priya.sharma@okicici',
    corridor: 'UAE_INR', fromAmount: 5000, fromCurrency: 'AED',
    toAmount: 113500, toCurrency: 'INR', fxRate: 22.7,
    transferFee: 350, fxFee: 180, totalFee: 530,
    route: 'npci', riskScore: 12, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.COMPLETED, purpose: 'Family support',
    settlementTime: 28, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001242', date: '2026-10-08T11:15:00Z',
    senderName: 'Ravi Krishnamurthy', senderCountry: 'USA', senderCurrency: 'USD',
    recipientName: 'Meena Krishnamurthy', recipientUpi: 'meena.k@okhdfcbank',
    corridor: 'US_INR', fromAmount: 2000, fromCurrency: 'USD',
    toAmount: 165800, toCurrency: 'INR', fxRate: 82.9,
    transferFee: 290, fxFee: 150, totalFee: 440,
    route: 'npci', riskScore: 8, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.COMPLETED, purpose: 'Education',
    settlementTime: 31, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001243', date: '2026-10-08T12:05:00Z',
    senderName: 'Anika Singh', senderCountry: 'UK', senderCurrency: 'GBP',
    recipientName: 'Rajesh Singh', recipientUpi: 'rajesh.s@ybl',
    corridor: 'UK_INR', fromAmount: 1500, fromCurrency: 'GBP',
    toAmount: 157200, toCurrency: 'INR', fxRate: 104.8,
    transferFee: 420, fxFee: 210, totalFee: 630,
    route: 'swift', riskScore: 22, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.PROCESSING, purpose: 'Medical',
    settlementTime: null, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001244', date: '2026-10-08T13:44:00Z',
    senderName: 'Vikram Nair', senderCountry: 'Singapore', senderCurrency: 'SGD',
    recipientName: 'Sunita Nair', recipientUpi: 'sunita.nair@paytm',
    corridor: 'SG_INR', fromAmount: 3000, fromCurrency: 'SGD',
    toAmount: 184200, toCurrency: 'INR', fxRate: 61.4,
    transferFee: 310, fxFee: 160, totalFee: 470,
    route: 'blockchain', riskScore: 35, riskLevel: 'MEDIUM',
    status: TRANSACTION_STATUS.COMPLIANCE_REVIEW, purpose: 'Business',
    settlementTime: null, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001245', date: '2026-10-08T14:20:00Z',
    senderName: 'Farhan Al-Rashid', senderCountry: 'UAE', senderCurrency: 'AED',
    recipientName: 'Amit Gupta', recipientUpi: 'amit.g@okaxis',
    corridor: 'UAE_INR', fromAmount: 50000, fromCurrency: 'AED',
    toAmount: 1135000, toCurrency: 'INR', fxRate: 22.7,
    transferFee: 950, fxFee: 580, totalFee: 1530,
    route: 'swift', riskScore: 74, riskLevel: 'HIGH',
    status: TRANSACTION_STATUS.RISK_FLAGGED, purpose: 'Personal',
    settlementTime: null, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001236', date: '2026-10-07T09:10:00Z',
    senderName: 'Deepa Menon', senderCountry: 'USA', senderCurrency: 'USD',
    recipientName: 'Suresh Menon', recipientUpi: 'suresh.m@oksbi',
    corridor: 'US_INR', fromAmount: 500, fromCurrency: 'USD',
    toAmount: 41450, toCurrency: 'INR', fxRate: 82.9,
    transferFee: 180, fxFee: 90, totalFee: 270,
    route: 'npci', riskScore: 5, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.COMPLETED, purpose: 'Family support',
    settlementTime: 26, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001237', date: '2026-10-07T10:45:00Z',
    senderName: 'Rohan Mehta', senderCountry: 'UK', senderCurrency: 'GBP',
    recipientName: 'Pooja Mehta', recipientUpi: 'pooja.mehta@okhdfcbank',
    corridor: 'UK_INR', fromAmount: 800, fromCurrency: 'GBP',
    toAmount: 83840, toCurrency: 'INR', fxRate: 104.8,
    transferFee: 280, fxFee: 140, totalFee: 420,
    route: 'npci', riskScore: 14, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.COMPLETED, purpose: 'Education',
    settlementTime: 33, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001238', date: '2026-10-07T14:30:00Z',
    senderName: 'Sara Al-Khoury', senderCountry: 'UAE', senderCurrency: 'AED',
    recipientName: 'Kavya Iyer', recipientUpi: 'kavya.iyer@ybl',
    corridor: 'UAE_INR', fromAmount: 8000, fromCurrency: 'AED',
    toAmount: 181600, toCurrency: 'INR', fxRate: 22.7,
    transferFee: 480, fxFee: 250, totalFee: 730,
    route: 'blockchain', riskScore: 28, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.COMPLETED, purpose: 'Personal',
    settlementTime: 12, blockchainTxHash: '0x7f4e2a1b9c3d5e8f2a4b6c8d0e2f4a6b8c0d2e4f',
  },
  {
    id: 'CBR-2026-001239', date: '2026-10-07T16:00:00Z',
    senderName: 'Kiran Desai', senderCountry: 'Singapore', senderCurrency: 'SGD',
    recipientName: 'Harish Desai', recipientUpi: 'harish.d@paytm',
    corridor: 'SG_INR', fromAmount: 1200, fromCurrency: 'SGD',
    toAmount: 73680, toCurrency: 'INR', fxRate: 61.4,
    transferFee: 250, fxFee: 120, totalFee: 370,
    route: 'npci', riskScore: 9, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.FAILED, purpose: 'Medical',
    settlementTime: null, blockchainTxHash: null,
  },
  {
    id: 'CBR-2026-001240', date: '2026-10-07T18:22:00Z',
    senderName: 'Jyoti Kapoor', senderCountry: 'USA', senderCurrency: 'USD',
    recipientName: 'Ritu Kapoor', recipientUpi: 'ritu.kapoor@okicici',
    corridor: 'US_INR', fromAmount: 1500, fromCurrency: 'USD',
    toAmount: 124350, toCurrency: 'INR', fxRate: 82.9,
    transferFee: 320, fxFee: 160, totalFee: 480,
    route: 'npci', riskScore: 18, riskLevel: 'LOW',
    status: TRANSACTION_STATUS.COMPLETED, purpose: 'Family support',
    settlementTime: 29, blockchainTxHash: null,
  },
];

export const DEMO_RECIPIENTS = [
  {
    id: 'rec-001', name: 'Priya Sharma', country: 'India',
    upiId: 'priya.sharma@okicici', bankName: 'ICICI Bank',
    verified: true, totalTransfers: 8, lastTransfer: '2026-10-08',
    totalVolume: 845000,
  },
  {
    id: 'rec-002', name: 'Meena Krishnamurthy', country: 'India',
    upiId: 'meena.k@okhdfcbank', bankName: 'HDFC Bank',
    verified: true, totalTransfers: 12, lastTransfer: '2026-10-08',
    totalVolume: 1230000,
  },
  {
    id: 'rec-003', name: 'Rajesh Singh', country: 'India',
    upiId: 'rajesh.s@ybl', bankName: 'Yes Bank',
    verified: true, totalTransfers: 3, lastTransfer: '2026-10-07',
    totalVolume: 480000,
  },
  {
    id: 'rec-004', name: 'Sunita Nair', country: 'India',
    upiId: 'sunita.nair@paytm', bankName: 'Paytm Payments Bank',
    verified: false, totalTransfers: 1, lastTransfer: '2026-10-08',
    totalVolume: 184200,
  },
  {
    id: 'rec-005', name: 'Amit Gupta', country: 'India',
    upiId: 'amit.g@okaxis', bankName: 'Axis Bank',
    verified: true, totalTransfers: 5, lastTransfer: '2026-10-06',
    totalVolume: 620000,
  },
];

export const ROUTE_STATS = {
  npci: { avgCostINR: 350, avgSpeedSec: 30, reliability: 98.7, availability: 'operational', txCount: 8420 },
  swift: { avgCostINR: 1200, avgSpeedSec: 172800, reliability: 99.1, availability: 'operational', txCount: 2180 },
  blockchain: { avgCostINR: 180, avgSpeedSec: 15, reliability: 94.2, availability: 'testnet', txCount: 1886 },
  bank: { avgCostINR: 900, avgSpeedSec: 86400, reliability: 99.5, availability: 'operational', txCount: 1086 },
};

export const VOLUME_CHART_DATA = [
  { date: 'Oct 1', txCount: 38, volumeINR: 8200000 },
  { date: 'Oct 2', txCount: 42, volumeINR: 9100000 },
  { date: 'Oct 3', txCount: 31, volumeINR: 6800000 },
  { date: 'Oct 4', txCount: 55, volumeINR: 12400000 },
  { date: 'Oct 5', txCount: 48, volumeINR: 10200000 },
  { date: 'Oct 6', txCount: 62, volumeINR: 14100000 },
  { date: 'Oct 7', txCount: 71, volumeINR: 16300000 },
  { date: 'Oct 8', txCount: 44, volumeINR: 9800000 },
];
