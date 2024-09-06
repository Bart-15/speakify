import Polly from 'aws-sdk/clients/polly';
import S3 from 'aws-sdk/clients/s3';

import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../middleware/errorHandler';
import validateResource from '../middleware/validateResource';
import { ProxyHandler } from '../types/handler.types';
import {
  processTextPayload,
  processTextValidationSchema,
} from '../validations/processText.validation';

export const s3 = new S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
});

const pollyCLient = new Polly();

//Handler
const processText: ProxyHandler = async (event, context) => {
  console.log(context);
  const reqBody = JSON.parse(event.body as string) as processTextPayload;

  const { text, voiceId } = reqBody;

  try {
    validateResource(processTextValidationSchema, reqBody); //Validation starts here

    const textFileName = `text/${uuidv4()}.txt`;

    //Uplaod text file to s3
    await s3
      .putObject({
        Bucket: process.env.SPEAKIFY_BUCKET_NAME!,
        Key: textFileName,
        Body: text,
        ContentType: 'text/plain',
      })
      .promise();

    // Synthesize speech using Polly
    const speechParams: Polly.SynthesizeSpeechInput = {
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      Engine: 'neural',
    };

    const pollyResponse = await pollyCLient.synthesizeSpeech(speechParams).promise();

    const audioFileName = `audio/${textFileName.replace('.txt', '.mp3')}`;

    // Upload the audio file to S3
    await s3
      .putObject({
        Bucket: process.env.SPEAKIFY_BUCKET_NAME!,
        Key: audioFileName,
        Body: pollyResponse.AudioStream,
        ContentType: 'audio/mpeg',
      })
      .promise();

    // Generate a pre-signed URL for the audio file
    const audioUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.SPEAKIFY_BUCKET_NAME!,
      Key: audioFileName,
      Expires: 3600, // URL expires in 1 hour
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Text to speech conversion completed', audioUrl }),
    };
  } catch (err) {
    console.log(err);
    return handleError(err);
  }
};

export const handler = processText;
