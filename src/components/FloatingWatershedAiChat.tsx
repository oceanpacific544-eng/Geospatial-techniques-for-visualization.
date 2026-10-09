import React from 'react';
import { AIChatAssistant, AIChatAssistantProps } from './AIChatAssistant';

export { AIChatAssistant };
export type { ChatMessage, AIChatAssistantProps } from './AIChatAssistant';

export const FloatingWatershedAiChat: React.FC<AIChatAssistantProps> = (props) => {
  return <AIChatAssistant {...props} />;
};

export default FloatingWatershedAiChat;
