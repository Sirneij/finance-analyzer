import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://348b21971fe395af3a7a3a544534b35c@o4508670763663360.ingest.us.sentry.io/4508670765629440',

  tracesSampleRate: 1.0,


});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
