import { useState, useEffect } from 'react';
import { APState, APPhase, StaffAutomation, LifestyleUpgrades, DynamicCostModifiers, APAction, AP_ACTION_CATALOG } from '../types/apEngine';
import { useGame } from '../store/GameContext';

export function useAPEngine() {
  const { state, setPlayer } = useGame();
  const player = state.player;

  // Determine age & base AP
  const age = player?.age || 19;
  const baseAP = age <= 20 ? 8 : age <= 25 ? 10 : 12;

  // Check off-season phase (Weeks 49-52)
  const isOffSeason = state.currentWeek >= 49 || state.storyFlags?.offSeasonActive;
  const currentPhase: APPhase = isOffSeason ? 'off_season' : (state.nextMatch && state.currentDay === 'SAT' ? 'matchday' : 'standard_day');

  const [apState, setApState] = useState<APState>(() => {
    const saved = localStorage.getItem('football_odyssey_ap_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, baseAP };
      } catch (e) {
        // fallback
      }
    }
    return {
      phase: currentPhase,
      currentAP: currentPhase === 'matchday' ? 3 : (isOffSeason ? 15 : baseAP),
      maxAP: isOffSeason ? 15 : baseAP,
      baseAP,
      strainZoneUsed: 0,
      dailyActionCounts: {},
      staff: {
        nutritionist: false,
        privatePhysio: false,
        prManager: false,
      },
      lifestyle: {
        recoveryChamber: false,
        privateJet: false,
        luxuryHousing: false,
      },
      modifiers: {
        teamCrisisActive: (player?.morale || 50) < 40 || (player?.trust || 50) < 40,
        derbyWeekActive: state.nextMatch?.matchType === 'DERBY',
        agentPerkDiscount: 0,
      }
    };
  });

  // Save to localStorage whenever apState changes
  useEffect(() => {
    localStorage.setItem('football_odyssey_ap_state', JSON.stringify(apState));
  }, [apState]);

  // Sync phase/baseAP on day change or matchday change
  useEffect(() => {
    const newPhase: APPhase = isOffSeason ? 'off_season' : (state.nextMatch && state.currentDay === 'SAT' ? 'matchday' : 'standard_day');
    
    // Calculate max AP with stamina / fatigue bonuses
    const stamina = player?.attributes?.stamina || 80;
    const fatigue = player?.fatigue || 20; // Lower fatigue is better condition
    const effectiveCondition = 100 - fatigue;
    
    let fitnessBonus = stamina >= 85 ? 2 : 0;
    if (apState.strainZoneUsed < 0) {
      fitnessBonus = 0;
    }
    const fatiguePenalty = effectiveCondition < 40 ? (effectiveCondition < 20 ? 4 : 2) : 0;
    const calculatedMax = isOffSeason ? 15 : Math.max(4, baseAP + fitnessBonus - fatiguePenalty + (apState.lifestyle?.privateJet ? 1 : 0) + (apState.lifestyle?.luxuryHousing ? 1 : 0));
    const resetAP = newPhase === 'matchday' ? 3 : calculatedMax;

    // Nutritionist passive: +10% Condition (reduces fatigue by 10) on daily reset
    if (apState.staff.nutritionist && player) {
      let recovery = 10;
      if (apState.lifestyle?.recoveryChamber) {
        recovery += 5; // Extra 5 fatigue recovered
      }
      const newFatigue = Math.max(0, (player.fatigue || 20) - recovery);
      setPlayer({ ...player, fatigue: newFatigue });
    } else if (apState.lifestyle?.recoveryChamber && player) {
      const newFatigue = Math.max(0, (player.fatigue || 20) - 5);
      setPlayer({ ...player, fatigue: newFatigue });
    }

    setApState(prev => ({
      ...prev,
      phase: newPhase,
      baseAP,
      maxAP: calculatedMax,
      currentAP: resetAP,
      strainZoneUsed: 0,
      dailyActionCounts: {},
      modifiers: {
        ...prev.modifiers,
        teamCrisisActive: (player?.morale || 50) < 40 || (player?.trust || 50) < 40,
        derbyWeekActive: state.nextMatch?.matchType === 'DERBY'
      }
    }));
  }, [state.currentDay, state.currentWeek, isOffSeason]);

  // Calculate dynamic cost of an action
  const getActionCost = (action: APAction): number | 'ALL' => {
    if (action.baseCost === 'ALL') return 'ALL';
    let cost = action.baseCost as number;

    // Repetition penalty (+1 AP per repeat on same day)
    const count = apState.dailyActionCounts[action.id] || 0;
    cost += count;

    // Crisis modifiers
    if (apState.modifiers.teamCrisisActive) {
      if (action.id === 'train_tactical') cost = Math.max(1, cost - 1);
      if (action.id === 'career_media') cost += 1;
    }

    // Agent perk discount for career actions
    if (action.category === 'career' && apState.modifiers.agentPerkDiscount > 0) {
      cost = Math.max(1, cost - apState.modifiers.agentPerkDiscount);
    }

    return cost;
  };

  // Perform action
  const performAction = (actionId: string): { success: boolean; message?: string } => {
    const action = AP_ACTION_CATALOG.find(a => a.id === actionId);
    if (!action) return { success: false, message: 'Action not found' };

    const cost = getActionCost(action);
    let effectiveCost = cost === 'ALL' ? apState.currentAP : (cost as number);

    const hasEnoughAP = apState.currentAP >= effectiveCost;
    const canUseStrain = !hasEnoughAP && apState.currentAP + (2 - apState.strainZoneUsed) >= effectiveCost;

    if (!hasEnoughAP && !canUseStrain) {
      return { success: false, message: 'Insufficient Action Points (Exhausted & Strain Limit Reached)' };
    }

    let newCurrentAP = apState.currentAP;
    let newStrainUsed = apState.strainZoneUsed;

    if (cost === 'ALL') {
      newCurrentAP = 0;
    } else if (hasEnoughAP) {
      newCurrentAP -= effectiveCost;
    } else {
      const deficit = effectiveCost - apState.currentAP;
      newCurrentAP = 0;
      newStrainUsed += deficit;
    }

    const newCounts = {
      ...apState.dailyActionCounts,
      [actionId]: (apState.dailyActionCounts[actionId] || 0) + 1
    };

    setApState(prev => ({
      ...prev,
      currentAP: newCurrentAP,
      strainZoneUsed: newStrainUsed,
      dailyActionCounts: newCounts
    }));

    // Apply player effects
    if (player) {
      let updatedPlayer = { ...player };
      const eff = action.effects;

      if (eff.conditionDelta) {
        // conditionDelta positive increases condition (reduces fatigue), negative increases fatigue
        let fatigueDelta = -eff.conditionDelta;
        if (apState.staff.privatePhysio && fatigueDelta > 0) {
          fatigueDelta = Math.round(fatigueDelta * 0.8);
        }
        updatedPlayer.fatigue = Math.min(100, Math.max(0, (updatedPlayer.fatigue || 20) + fatigueDelta));
      }
      if (eff.staminaDelta && updatedPlayer.attributes) {
        updatedPlayer.attributes.stamina = Math.min(100, (updatedPlayer.attributes.stamina || 75) + eff.staminaDelta);
      }
      if (eff.managerTrustDelta) {
        updatedPlayer.trust = Math.min(100, Math.max(0, (updatedPlayer.trust || 50) + eff.managerTrustDelta));
      }
      if (eff.moraleDelta) {
        updatedPlayer.morale = Math.min(100, Math.max(0, (updatedPlayer.morale || 50) + eff.moraleDelta));
      }
      if (eff.agentRelationshipDelta && updatedPlayer.relationships) {
        updatedPlayer.relationships.agent = Math.min(100, Math.max(0, (updatedPlayer.relationships.agent || 50) + eff.agentRelationshipDelta));
      }
      if (eff.reputationDelta && updatedPlayer.reputation) {
        updatedPlayer.reputation.world = Math.min(100, (updatedPlayer.reputation.world || 50) + Math.round(eff.reputationDelta / 10));
      }
      if (eff.attributeXP && updatedPlayer.attributes) {
        for (const [attr, val] of Object.entries(eff.attributeXP)) {
          if ((updatedPlayer.attributes as any)[attr] !== undefined) {
            const currentVal = (updatedPlayer.attributes as any)[attr];
            (updatedPlayer.attributes as any)[attr] = Math.min(99, currentVal + Math.round((val as number) / 10));
          }
        }
      }

      setPlayer(updatedPlayer);
    }

    return { success: true, message: `Successfully performed: ${action.title}` };
  };

  // Toggle Staff
  const toggleStaff = (staffKey: keyof StaffAutomation) => {
    setApState(prev => ({
      ...prev,
      staff: {
        ...prev.staff,
        [staffKey]: !prev.staff[staffKey]
      }
    }));
  };

  const toggleLifestyle = (lifestyleKey: keyof LifestyleUpgrades) => {
    setApState(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [lifestyleKey]: !prev.lifestyle?.[lifestyleKey]
      }
    }));
  };

  return {
    apState,
    setApState,
    getActionCost,
    performAction,
    toggleStaff,
    toggleLifestyle
  };
}
