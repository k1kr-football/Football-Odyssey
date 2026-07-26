const fs = require('fs');
let code = fs.readFileSync('src/utils/notifications.ts', 'utf8');

const oldCheck = `  // 1. CRITICAL PRIORITY: Needs immediate action or has major consequences
  if (
    subject.includes('CONTRACT DISPUTE') ||
    subject.includes('RELEASE CLAUSE') ||
    subject.includes('BOARD WARNING') ||
    subject.includes('EXPECTATIONS UPDATE') ||
    subject.includes('RETIREMENT') ||
    subject.includes('FINANCIAL EMBARGO') ||
    subject.includes('CRITICAL') ||
    subject.includes('SACK') ||
    subject.includes('ASSESSMENT PERIOD CONCLUSION') ||
    type === 'CONTRACT' ||
    (type === 'OFFER' && subject.includes('BID'))
  ) {
    priority = 'CRITICAL';
  }`;

const newCheck = `  // 1. CRITICAL PRIORITY (Mandatory): Player career decisions (own contract renewal, transfer request response, contract dispute resolution, agent meeting, board-level matter directly involving player, dynamic calendar event with stat consequences)
  if (
    subject.includes('CONTRACT DISPUTE') ||
    subject.includes('RELEASE CLAUSE') ||
    subject.includes('BOARD WARNING') ||
    subject.includes('EXPECTATIONS UPDATE') ||
    subject.includes('RETIREMENT') ||
    subject.includes('FINANCIAL EMBARGO') ||
    subject.includes('CRITICAL') ||
    subject.includes('SACK') ||
    subject.includes('TESTIMONIAL') ||
    subject.includes('ASSESSMENT PERIOD CONCLUSION') ||
    subject.includes('YOUR CONTRACT') ||
    subject.includes('CONTRACT OFFER') ||
    (type === 'CONTRACT' && !subject.includes('MANAGER EXTENDS SQUAD') && !subject.includes('TEAMMATE CONTRACT')) ||
    (type === 'OFFER' && (subject.includes('BID') || subject.includes('TRANSFER REQUEST')))
  ) {
    priority = 'CRITICAL';
  }`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync('src/utils/notifications.ts', code);
  console.log('Successfully updated notifications.ts');
} else {
  console.log('Old check not found exactly, trying regex or alternate replacement');
}
