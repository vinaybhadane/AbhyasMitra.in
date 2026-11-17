import { getToken, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebase';
let instance: ReturnType<typeof initializeAppCheck> | undefined;
export async function appCheckHeaders(): Promise<Record<string, string>> {
 const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
 if (typeof window === 'undefined' || !siteKey) return {};
 instance ||= initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true });
 return { 'X-Firebase-AppCheck': (await getToken(instance)).token };
}
