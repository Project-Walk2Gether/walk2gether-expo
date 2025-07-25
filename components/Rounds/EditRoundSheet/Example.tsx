import React, { useState } from 'react';
import { Sheet } from 'tamagui';
import { Round, WithId } from 'walk2gether-shared';
import EditRoundSheet from './index';

interface RoundDetailsExampleProps {
  round: WithId<Round>;
}

export default function RoundDetailsExample({ round }: RoundDetailsExampleProps) {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  
  const handleEditRound = () => {
    setIsEditSheetOpen(true);
  };
  
  const handleEditClose = () => {
    setIsEditSheetOpen(false);
  };
  
  const handleRoundUpdated = () => {
    // Refresh data or update UI as needed
    console.log("Round updated successfully");
  };

  return (
    <>
      {/* Your component that opens the edit sheet */}
      <Button onPress={handleEditRound}>Edit Round</Button>
      
      {/* Edit Round Sheet */}
      <Sheet
        modal
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        snapPoints={[40]}
        dismissOnSnapToBottom
        position={0}
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame>
          <EditRoundSheet
            round={round}
            onClose={handleEditClose}
            onSave={handleRoundUpdated}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
