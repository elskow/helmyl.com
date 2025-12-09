import { datadogRum } from '@datadog/browser-rum';
import { browser } from '$app/environment';

let initialized = false;

export function initDatadogRum() {
	if (!browser || initialized) return;

	datadogRum.init({
		applicationId: '7ebe4038-109e-4258-9461-ff815190da50',
		clientToken: 'pub27e5b0afb822abf2ba1575f494f608e0',
		site: 'us5.datadoghq.com',
		service: 'helmyl.com',
		env: 'prod',
		// Specify a version number to identify the deployed version of your application in Datadog
		// version: '1.0.0',
		sessionSampleRate: 100,
		sessionReplaySampleRate: 20,
		trackBfcacheViews: true,
		defaultPrivacyLevel: 'mask-user-input'
	});

	initialized = true;
}
