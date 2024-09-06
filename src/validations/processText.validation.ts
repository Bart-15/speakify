import z, { object, string, TypeOf } from 'zod';
import { voices } from '../helpers/const';

export const processTextValidationSchema = object({
  text: string().max(3000, {
    message:
      'The input text exceeds the maximum allowed length of 3000 characters. Please reduce the text length and try again.',
  }),
  voiceId: z.enum(voices, {
    message: `Invalid VoiceId. Please select a valid voice. ${voices.join(', ')}`,
  }),
});

export type processTextPayload = TypeOf<typeof processTextValidationSchema>;
