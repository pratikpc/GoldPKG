import { differenceBy, uniqBy } from 'lodash';
import type { ReleaseType } from 'semver';
import { DependencyT } from '../constants/types';
import UpgradeVersion from '../util/version';
import BaseParser from './BaseParser';
import configurationParser from './ConfigurationManager';

class VCPkgManifest extends BaseParser {
    constructor(FilePath?: string) {
        super('vcpkg.json', FilePath);
    }

    public get Config() {
        return this.ReadJson;
    }

    // Default Format
    //   "dependencies": [
    //     "freetype",
    //     {
    //       "name": "harfbuzz",
    //       "features": [ "glib" ],
    //       "platform": "!(windows & static) & !osx"
    //     }
    //   ]
    // We Only Care about the Names Here
    private static DependenciesInManifestToNames(
        dependencies: DependencyT[]
    ) {
        return dependencies.map(this.GetDependencyName);
    }

    public get Dependencies() {
        return this.Config.then(
            (config) =>
                (config[
                    configurationParser.DependencyKey
                ] ?? []) as DependencyT[]
        );
    }

    public get DependencyNames() {
        return this.Dependencies.then((dependencies) =>
            VCPkgManifest.DependenciesInManifestToNames(
                dependencies
            )
        );
    }

    private static GetDependencyName(dep: DependencyT) {
        return typeof dep === 'string' ? dep : dep.name;
    }

    public async AddPackages(pkgNames: string[]) {
        const file = await this.ReadJson;
        let dependencies = [
            // Set Dependencies or Empty
            ...((file[configurationParser.DependencyKey] ??
                []) as DependencyT[]),
            // Add New Packages
            // Remove Triplet Info
            ...pkgNames.map((pkg) => pkg.split(':')[0])
        ] as DependencyT[];

        // Retain Only Unique Dependencies
        dependencies = uniqBy(
            dependencies,
            VCPkgManifest.GetDependencyName
        );

        dependencies.sort();

        file[
            configurationParser.DependencyKey
        ] = dependencies;
        await this.WriteJson(file);
    }

    public async RemovePackages(pkgNames: string[]) {
        if (!this.Exists) return;
        const file = await this.ReadJson;
        // Remove Common Dependencies
        let dependencies = differenceBy(
            // Set Dependencies or Empty
            (file[configurationParser.DependencyKey] ??
                []) as DependencyT[],
            // Add New Packages
            // Remove Triplet Info
            pkgNames.map((pkg) => pkg.split(':')[0]),
            VCPkgManifest.GetDependencyName
        ) as DependencyT[];

        // Retain Only Unique Dependencies
        dependencies = uniqBy(
            dependencies,
            VCPkgManifest.GetDependencyName
        );

        file[
            configurationParser.DependencyKey
        ] = dependencies;
        await this.WriteJson(file);
    }

    public async UpgradeVersion(release: ReleaseType) {
        if (!this.Exists) return null;
        const json = await this.Config;
        const localVersion = json['version-string'];
        const version = UpgradeVersion(
            localVersion,
            release
        );
        json['version-string'] = version;
        await this.WriteJson(json);
        return version;
    }

    // // Only works on VCPKG.json
    // public async RemovePackages(packages: string[]) {
    //     await this.SetPackages(
    //         difference(await this.RawDependencies, packages)
    //     );
    // }
}

const vcpkgManifest = new VCPkgManifest();
export default vcpkgManifest;
