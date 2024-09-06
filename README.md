# Speakify (Amazon Polly Text-to-Speech App)

This project is a serverless application that converts text into speech using Amazon Polly. The generated speech audio is stored in an S3 bucket for easy access.

## Architecture

- Text and VoiceID Input: Users can input text from various sources, including articles, books, newsletters, etc. Users can select a Voice ID based on their needs. The available Voice IDs can be found in the [const.ts](src/helpers/const.ts) file.
- Lambda Function: A Lambda function processes the text input, voice ID, and sends it to Amazon Polly for speech synthesis.
- Amazon Polly: Amazon Polly converts the text into speech.
- Amazon S3: For storing the generated audio files.

## Setup and Deployment - Backend Service

Prerequisites

- Node.js and npm
- Serverless framework installed globally (npm install -g serverless)
- AWS CLI configured with appropriate IAM permissions

1. Clone the repository `git clone https://github.com/Bart-15/speakify.git`
1. Run `npm install`
1. Run `cp serverless.template.yml serverless.yml`
1. Deploy the application to AWS using the Serverless framework: `serverless deploy`

## Test the API

`curl -X POST https://api.example.com/dev/process \
-H "Content-Type: application/json" \
-d '{
  "text": "Hello, how are you?",
  "voiceId": "Joanna"
}'`
