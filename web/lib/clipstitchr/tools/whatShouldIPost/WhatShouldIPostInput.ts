import type { WhatShouldIPostCameraPreference } from "@/lib/clipstitchr/tools/whatShouldIPost/WhatShouldIPostCameraPreference";
import type { WhatShouldIPostCapacity } from "@/lib/clipstitchr/tools/whatShouldIPost/WhatShouldIPostCapacity";
import type { WhatShouldIPostFunnelStage } from "@/lib/clipstitchr/tools/whatShouldIPost/WhatShouldIPostFunnelStage";
import type { WhatShouldIPostGoal } from "@/lib/clipstitchr/tools/whatShouldIPost/WhatShouldIPostGoal";

export type WhatShouldIPostInput = {
  assets: readonly string[];
  cameraPreference: WhatShouldIPostCameraPreference;
  capacity: WhatShouldIPostCapacity;
  funnelStage: WhatShouldIPostFunnelStage;
  goal: WhatShouldIPostGoal;
};
