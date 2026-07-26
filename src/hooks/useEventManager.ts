import { useCallback } from 'react';
import { GameState } from '../store/GameContext';
import { DailyEvent, Player } from '../types';
import { ALL_EVENTS } from '../data/events';

export function useEventManager() {
  /**
   * Evaluates if a player is eligible for transfer rumors around major football clubs.
   * Based on performance data (form >= 70, apps >= 3),
   * tenure (week >= 4), and contractual status.
   */
  const isEligibleForTransferRumor = useCallback((player: Player, state: GameState): boolean => {
    if (!player) return false;
    
    const performanceCheck = (player.form || 0) >= 70 || (player.ovr || 0) >= 70;
    const tenureCheck = state.currentWeek >= 4 || (player.stats?.apps || 0) >= 2;
    const contractCheck = !player.loanInfo; // Not on loan
    const listingCheck = !!player.transferListed;

    return (performanceCheck && tenureCheck && contractCheck) || listingCheck;
  }, []);

  /**
   * Evaluates if a player is eligible for a manager promise (such as guaranteed minutes or position changes).
   * Typically occurs when there's low trust but a rising performance form,
   * or when the player is a key fixture of the squad asking to extend terms.
   */
  const isEligibleForManagerPromise = useCallback((player: Player, state: GameState): boolean => {
    if (!player) return false;

    const trustLimit = (player.relationships?.manager ?? 50) < 60;
    const risingForm = (player.form || 0) >= 65;
    const isRegular = player.contract?.status === 'First Teamer' || player.contract?.status === 'Star Player';
    const lowPromiseCount = (player.promises?.length || 0) < 3;

    return ((trustLimit && risingForm) || isRegular) && lowPromiseCount;
  }, []);

  /**
   * Evaluates if a player is eligible for sponsorship endorsement deals.
   * Requires consistent fan count (above 30) or strong media perception.
   */
  const isEligibleForSponsorshipOpportunity = useCallback((player: Player, state: GameState): boolean => {
    if (!player) return false;
    return (player.fans || 0) >= 30 || (player.mediaPerception || 0) >= 60 || state.currentWeek > 3;
  }, []);

  const checkPreconditions = useCallback((state: GameState, eventId: string): boolean => {
    const eventDef = ALL_EVENTS.find(e => e.id === eventId);
    if (!eventDef) return false;
    try {
      return eventDef.isEligible(state);
    } catch (err) {
      console.error('Error checking precondition for event:', eventId, err);
      return false;
    }
  }, []);

  const generateEvent = useCallback((state: GameState, isTransferWindow: boolean): DailyEvent | null => {
    if (!state || !state.player) return null;
    
    // Evaluate contextual pre-conditions here generally
    const player = state.player;
    const isNewSigning = state.currentWeek < 10 && (player.contract?.wage || 0) > 0;

    const rand = Math.random();
    let chance = 0.35; 
    
    if (isTransferWindow) chance += 0.1;
    if ((player.form || 0) <= 3) chance += 0.15; 
    
    // Gating contextual modifier
    if (isNewSigning) chance += 0.05; // New signings get slightly more events initially

    if (rand > chance) return null;

    const eligibleEvents = ALL_EVENTS.filter(e => {
      try {
        return e.isEligible(state);
      } catch (err) {
        console.error('Error checking eligibility for event:', e.id, err);
        return false;
      }
    });
    
    if (eligibleEvents.length === 0) return null;
    
    let selectedEventDef = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];

    return {
      id: selectedEventDef.id,
      title: selectedEventDef.title,
      description: selectedEventDef.description(state),
      category: selectedEventDef.category as any,
      choices: selectedEventDef.choices.map((c, i) => ({
        text: c.text,
        actionType: "ENGINE_CHOICE_" + selectedEventDef.id + "_" + i
      }))
    };
  }, []);

  return {
    generateEvent,
    checkPreconditions,
    isEligibleForTransferRumor,
    isEligibleForManagerPromise,
    isEligibleForSponsorshipOpportunity
  };
}
