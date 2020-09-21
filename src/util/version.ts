import semver from 'semver';
import type { ReleaseType } from 'semver';

export default function UpgradeVersion(
    version: string,
    release: ReleaseType,
    identifier: string | undefined = undefined
) {
    const validVersion =
        semver.valid(semver.coerce(version)) ?? version;
    return (
        semver.inc(validVersion, release, identifier) ??
        version
    );
}
