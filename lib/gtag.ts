"use client";

import { sendGAEvent as originalSendGAEvent } from "@next/third-parties/google";

export const sendGAEvent = (
  event: string,
  params?: Record<string, string | number | string[]>,
) => {
  originalSendGAEvent({ event, value: params });
};