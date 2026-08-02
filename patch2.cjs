const fs = require('fs');
let code = fs.readFileSync('src/screens/Transfers.tsx', 'utf8');

const finalizeTransferCode = `
 const finalizeTransfer = (offer: TransferOffer) => {
   const club = CLUBS.find(c => c.symbol === offer.clubSymbol);
   
   let newFans = player.fans;
   let newTimeline = [...(player.timeline || [])];
   
   if (offer.isHomecoming) {
      newFans += 25;
      newTimeline.push({
        id: \`transfer_homecoming_\${Date.now()}\`,
        week: state.currentWeek,
        day: state.currentDay,
        type: 'MILESTONE',
        title: \`🏆 CAREER MILESTONE: The Homecoming\`,
        description: \`Returned to \${club?.name}, the club where it all began. The fans are ecstatic to have you back! (+25 Fan Adoration)\`,
        clubSymbol: offer.clubSymbol
      });
   }
   
   newTimeline.push({
     id: \`transfer_\${Date.now()}\`,
     week: state.currentWeek,
     day: state.currentDay,
     type: 'TRANSFER',
     title: \`Transferred to \${club?.name}\`,
     description: \`Signed a \${offer.length}-year deal worth £\${offer.wage.toLocaleString()}/week.\`,
     clubSymbol: offer.clubSymbol
   });

   setPlayer({ 
    ...player, 
    currentClubSymbol: offer.clubSymbol,
    transferOffers: [],
    contract: {
    ...player.contract,
    wage: offer.wage,
    expires: \`June 20\${27 + offer.length}\`,
    yearsLeft: offer.length,
    status: 'Squad Player',
    releaseClause: offer.releaseClause,
    goalBonus: offer.contractBonus?.type === 'GOAL' ? offer.contractBonus.amount : player.contract.goalBonus,
    appearanceBonus: offer.contractBonus?.type === 'APPEARANCE' ? offer.contractBonus.amount : player.contract.appearanceBonus,
    },
    transferListed: false,
    fans: newFans,
    transferRequestStatus: 'NONE',
    timeline: newTimeline
   });
   setNegotiatingOffer(null);
   setPendingMedicalOffer(null);
   setIsMedicalModalOpen(false);
 };

 const handleMedicalComplete = (success: boolean, newOffer?: TransferOffer) => {
   if (success && !newOffer) {
     // Successful medical, finalize the pending offer
     const offer = player.transferOffers.find(o => o.id === pendingMedicalOffer);
     if (offer) {
       finalizeTransfer(offer);
     } else {
       setIsMedicalModalOpen(false);
     }
   } else if (newOffer) {
     // Failed but revised offer returned
     setPlayer({
       ...player,
       transferOffers: player.transferOffers.map(o => o.id === pendingMedicalOffer ? newOffer : o)
     });
     setIsMedicalModalOpen(false);
     setPendingMedicalOffer(null);
   } else {
     // Completely failed, offer withdrawn
     setPlayer({ ...player, transferOffers: player.transferOffers.filter(o => o.id !== pendingMedicalOffer) });
     setInbox([
      ...state.inbox, 
      {
      id: \`medical_failed_\${Date.now()}\`,
      sender: 'AGENT',
      subject: 'Transfer Collapsed',
      content: \`The transfer has fallen through after you failed the medical. The club has withdrawn their offer.\`,
      read: false,
      type: 'NEWS',
      timestamp: 'MON 14:00',
      choices: []
      }
     ]);
     setIsMedicalModalOpen(false);
     setPendingMedicalOffer(null);
   }
 };
`;

// Replace handleNegotiateOption ACCEPT logic
const originalAcceptLogic = `
  if (action === 'ACCEPT') {
   // Transfer the player
   const club = CLUBS.find(c => c.symbol === offer.clubSymbol);
   
   let newFans = player.fans;
   let newTimeline = [...(player.timeline || [])];
   
   if (offer.isHomecoming) {
      newFans += 25;
      newTimeline.push({
        id: \`transfer_homecoming_\${Date.now()}\`,
        week: state.currentWeek,
        day: state.currentDay,
        type: 'MILESTONE',
        title: \`🏆 CAREER MILESTONE: The Homecoming\`,
        description: \`Returned to \${club?.name}, the club where it all began. The fans are ecstatic to have you back! (+25 Fan Adoration)\`,
        clubSymbol: offer.clubSymbol
      });
   }
   
   newTimeline.push({
     id: \`transfer_\${Date.now()}\`,
     week: state.currentWeek,
     day: state.currentDay,
     type: 'TRANSFER',
     title: \`Transferred to \${club?.name}\`,
     description: \`Signed a \${offer.length}-year deal worth £\${offer.wage.toLocaleString()}/week.\`,
     clubSymbol: offer.clubSymbol
   });

   setPlayer({ 
    ...player, 
    currentClubSymbol: offer.clubSymbol,
    transferOffers: [],
    contract: {
    ...player.contract,
    wage: offer.wage,
    expires: \`June 20\${27 + offer.length}\`,
    yearsLeft: offer.length,
    status: 'Squad Player',
    releaseClause: offer.releaseClause,
    goalBonus: offer.contractBonus?.type === 'GOAL' ? offer.contractBonus.amount : player.contract.goalBonus,
    appearanceBonus: offer.contractBonus?.type === 'APPEARANCE' ? offer.contractBonus.amount : player.contract.appearanceBonus,
    },
    transferListed: false,
    fans: newFans,
    transferRequestStatus: 'NONE',
    timeline: newTimeline
   });
   setNegotiatingOffer(null);
   return;
  }`;

const newAcceptLogic = `
  if (action === 'ACCEPT') {
    setPendingMedicalOffer(offer.id);
    setIsMedicalModalOpen(true);
    return;
  }`;

code = code.replace(originalAcceptLogic, newAcceptLogic);
code = code.replace("const handleRejectOffer = (id: string) => {", finalizeTransferCode + "\n const handleRejectOffer = (id: string) => {");

// Add Modal at the end of the file
const renderModal = `
  <SuggestSigningModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />
  <MedicalCheckModal 
    isOpen={isMedicalModalOpen} 
    offer={player.transferOffers.find(o => o.id === pendingMedicalOffer) || null} 
    onClose={() => setIsMedicalModalOpen(false)} 
    onComplete={handleMedicalComplete} 
  />
 </div>
 `;
code = code.replace("  <SuggestSigningModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />\n </div>", renderModal);

fs.writeFileSync('src/screens/Transfers.tsx', code);
