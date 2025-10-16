import { Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const MODAL_CONSTANTS = {
  SCREEN_HEIGHT,
  OPEN_OFFSET_RATIO: 0.1,
  DURATION_OPEN: 280,
  DURATION_CLOSE: 250,
  DURATION_OVERLAY: 250,
  DURATION_SNAP_BACK: 180,
  DRAG_CLOSE_THRESHOLD: 120,
  VELOCITY_CLOSE_THRESHOLD: 1,
};