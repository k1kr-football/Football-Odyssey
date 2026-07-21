/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InboxMessage, NotificationPriority } from '../types';

/**
 * Automatically assigns a NotificationPriority to any message based on its semantic attributes
 * if it doesn't already have one. This guarantees backward compatibility and prevents null fields.
 */
export function tagInboxMessagePriority(msg: any): InboxMessage {
  if (msg.priority) return msg as InboxMessage;

  let priority: NotificationPriority = 'ROUTINE';

  const subject = (msg.subject || '').toUpperCase();
  const sender = (msg.sender || '').toUpperCase();
  const type = msg.type || 'NEWS';

  // 1. CRITICAL PRIORITY: Needs immediate action or has major consequences
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
  }
  // 2. IMPORTANT PRIORITY: Prompt attention, not immediately catastrophic
  else if (
    type === 'TRANSFER' ||
    type === 'OFFER' ||
    sender.includes('MANAGER') ||
    sender.includes('DIRECTOR') ||
    sender.includes('COACH') ||
    sender.includes('AGENT') ||
    sender.includes('CHIEF PHYSIO') ||
    sender.includes('MEDICAL') ||
    subject.includes('MILESTONE') ||
    subject.includes('ACHIEVEMENT') ||
    subject.includes('SCOUT REPORT') ||
    subject.includes('MENTORSHIP') ||
    subject.includes('SPONSOR') ||
    subject.includes('INJURY') ||
    subject.includes('RECOVER')
  ) {
    priority = 'IMPORTANT';
  }
  // 3. AMBIENT PRIORITY: Passive flavor news from the world
  else if (
    sender.includes('WORLD SIMULATION') ||
    sender.includes('LEAGUE NEWS') ||
    subject.includes('GLOBAL NEWS') ||
    subject.includes('OTHER RESULTS')
  ) {
    priority = 'AMBIENT';
  }
  // 4. ROUTINE PRIORITY: Default for minor, high-volume items
  else {
    priority = 'ROUTINE';
  }

  return {
    ...msg,
    priority
  } as InboxMessage;
}

/**
 * Filter and group the inbox messages based on player's adjustable verbosity setting
 * and Digest Mode toggle.
 *
 * @param inbox The flat list of all inbox messages
 * @param verbosity The player's adjustable notification verbosity ('ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY')
 * @param digestModeEnabled Whether Routine items are batched into a Weekly Digest
 * @returns Filtered, digested list of inbox messages
 */
export function processInboxMessages(
  inbox: InboxMessage[],
  verbosity: 'ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY' = 'ALL',
  digestModeEnabled: boolean = true
): InboxMessage[] {
  // First, tag all messages to guarantee they have a priority
  const taggedInbox = inbox.map(tagInboxMessagePriority);

  // Apply verbosity filtration
  const verbosityFiltered = taggedInbox.filter(msg => {
    if (msg.priority === 'CRITICAL') return true; // Critical is NEVER suppressed
    if (verbosity === 'CRITICAL_ONLY') return false;
    if (verbosity === 'IMPORTANT_AND_CRITICAL' && msg.priority !== 'IMPORTANT') return false;
    return true; // 'ALL' allows all
  });

  if (!digestModeEnabled) {
    return verbosityFiltered;
  }

  // Group unread ROUTINE messages into a Weekly Update Digest
  const unreadRoutine = verbosityFiltered.filter(msg => msg.priority === 'ROUTINE' && !msg.read);
  const otherMessages = verbosityFiltered.filter(msg => msg.priority !== 'ROUTINE' || msg.read);

  if (unreadRoutine.length <= 1) {
    // No need to create a digest for 0 or 1 routine message
    return verbosityFiltered;
  }

  // Create the Digest Entry
  const digestEntry: InboxMessage = {
    id: `digest_routine_group_${unreadRoutine[0].id}`,
    sender: 'WEEKLY CORRESPONDENCE DIGEST',
    subject: `Weekly Update Digest: ${unreadRoutine.length} Unread Updates 📊`,
    content: `You have received ${unreadRoutine.length} routine updates this week. Click on this digest entry to read, expand, and manage them all in one tidy view.`,
    read: false,
    type: 'NEWS',
    timestamp: unreadRoutine[0].timestamp || 'MON 08:00',
    choices: [
      { text: 'Mark All Digest Items Read', type: 'digest_mark_all_read' }
    ],
    priority: 'ROUTINE',
    digestItems: unreadRoutine
  };

  return [digestEntry, ...otherMessages];
}
