import React from "react";
import { WalkWizard } from "../../../components/WalkWizard";
import { WithWalkFormProvider } from "../../../context/WalkFormContext";

function NewWalkWizardScreen() {
  return <WalkWizard />;
}

export default WithWalkFormProvider(NewWalkWizardScreen);
