import { dirname, resolve } from 'node:path';

// Those three imports needs to always be `type` imports, as we always want to import them dynamically
import type * as svelte from '@astrojs/svelte/dist/editor.cjs';
import type * as vue from '@astrojs/vue/dist/editor.cjs';
import type * as prettier from 'prettier';

let isTrusted = true;

export function setIsTrusted(_isTrusted: boolean) {
	isTrusted = _isTrusted;
}

export function getPackagePath(packageName: string, fromPath: string[]): string | undefined {
	const paths = [];
	if (isTrusted) {
		paths.unshift(...fromPath);
	}

	try {
		return dirname(require.resolve(packageName + '/package.json', { paths }));
	} catch (e) {
		return undefined;
	}
}

function importEditorIntegration<T>(packageName: string, fromPath: string): T | undefined {
	const pkgPath = getPackagePath(packageName, [fromPath]);

	if (pkgPath) {
		try {
			const main = resolve(pkgPath, 'dist', 'editor.cjs');

			return require(main) as T;
		} catch (e) {
			console.error(
				`Couldn't load editor module from ${pkgPath}. Make sure you're using at least version v0.2.1 of the corresponding integration`
			);

			return undefined;
		}
	}

	return undefined;
}

export function importSvelteIntegration(fromPath: string): typeof svelte | undefined {
	return importEditorIntegration('@astrojs/svelte', fromPath);
}

export function importVueIntegration(fromPath: string): typeof vue | undefined {
	return importEditorIntegration('@astrojs/vue', fromPath);
}

export function importPrettier(fromPath: string): typeof prettier | undefined {
	const prettierPkg = getPackagePath('prettier', [fromPath, __dirname]);

	if (!prettierPkg) {
		return undefined;
	}

	return require(prettierPkg);
}

export function getPrettierPluginPath(fromPath: string): string | undefined {
	const prettierPluginPath = getPackagePath('prettier-plugin-astro', [fromPath, __dirname]);

	if (!prettierPluginPath) {
		return undefined;
	}

	return prettierPluginPath;
}
