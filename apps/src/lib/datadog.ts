import { datadogRum } from '@datadog/browser-rum';
import { browser } from '$app/environment';

let initialized = false;

export function initDatadogRum() {
	if (!browser || initialized) return;

	datadogRum.init({
		applicationId: '54816f95-1742-484b-a532-88242bc9f8e5',
		clientToken: 'pub6891be17805c2e1650114c75ac87b0d6',
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
