import { Polly, S3 } from 'aws-sdk';
import { ProxyHandler } from 'src/types/handler.types';
import { v4 as uuidv4 } from 'uuid';

export const s3 = new S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
});

const polly = new Polly();

const processText: ProxyHandler = async event => {
  try {
    const parsedBody = JSON.parse(event.body as string);

    if (!parsedBody.text) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Text is required' }) };
    }

    const { text } = parsedBody;
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
      VoiceId: 'Joanna',
      Engine: 'neural',
    };

    const pollyResponse = await polly.synthesizeSpeech(speechParams).promise();

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
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ooops, something went wrong. Please try again later',
        error: err,
      }),
    };
  }
};

export const handler = processText;
