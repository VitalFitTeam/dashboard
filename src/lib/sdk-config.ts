import { VitalFit } from "@vitalfit/sdk";

const devModeFlag = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export const api = VitalFit.getInstance(devModeFlag);
