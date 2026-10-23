import { AI_CONSENT_COPY, AI_CONSENT_VERSION } from '../../config/legal';
import { appAlert, appConfirm } from '../dialog/appDialog';
import { useAuthStore } from '../../stores/useAuthStore';
import { getApiErrorMessage } from '../../services/api/client';

/** Shows a blocking consent dialog when the user has not accepted the current version. */
export async function ensureAiConsent(): Promise<boolean> {
  const { user, acceptConsent, refreshProfile } = useAuthStore.getState();

  if (user && user.needsConsent === false) {
    return true;
  }

  if (user?.consentVersion === AI_CONSENT_VERSION) {
    return true;
  }

  try {
    await refreshProfile();
  } catch {
    // fall through to prompt
  }

  const latest = useAuthStore.getState().user;
  if (latest && latest.needsConsent === false) {
    return true;
  }

  const agreed = await appConfirm({
    title: 'AI processing consent',
    message: AI_CONSENT_COPY,
    confirmLabel: 'I agree',
    cancelLabel: 'Not now',
  });

  if (!agreed) {
    return false;
  }

  try {
    await acceptConsent(AI_CONSENT_VERSION);
    return true;
  } catch (error) {
    await appAlert({
      title: 'Consent failed',
      message: getApiErrorMessage(error),
    });
    return false;
  }
}
