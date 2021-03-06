import { differenceBy, uniqBy } from 'lodash';
import type { ReleaseType } from 'semver';
import { DependencyT } from '../constants/types';
import UpgradeVersion from '../util/version';
import BaseParser from './BaseParser';
import configurationParser from './ConfigurationManager';

import { AddToolchainPathToTopLevelCMakeLists } from './CMakeParsers';

const DEFAULT_VCPKG_CONF = {
    name: 'goldpkg-template',
    // Same default Version as Node.JS NPM
    'version-string': '1.0.0',
    // No Dependencies
    dependencies: [] as string[],
    // Same default License as Node.JS
    license: 'ISC',
    description: ''
};

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
        if (!this.Exists || !(await this.IsFile)) return;
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
        if (!this.Exists || !(await this.IsFile))
            return null;
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

    public async WriteDefaultIfNotExists() {
        if (!this.Exists || !(await this.IsFile)) {
            await this.WriteJson(
                DEFAULT_VCPKG_CONF,
                // Do Not check for file Existence
                false
            );

            await this.LoadFile();

            await AddToolchainPathToTopLevelCMakeLists(
                this.DirName
            );
        }
    }
}

const vcpkgManifest = new VCPkgManifest();
export default vcpkgManifest;
