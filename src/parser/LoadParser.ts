import path from 'path';

import type GoldPKGArgs from '../args';
import { AddToolchainPathToTopLevelCMakeLists } from './CMakeParsers';
import configurationParser from './ConfigurationManager';
import vcpkgManifest from './VCPkgManifest';

export default async function LoadParser(
    argv: typeof GoldPKGArgs
) {
    await Promise.all([
        configurationParser.LoadFile(argv['config-json']),
        vcpkgManifest.LoadFile(argv['vcpkg-json'])
    ]);
    configurationParser.Config.cmake = argv.cmake ?? '';

    configurationParser.Config['vcpkg-root'] = path.resolve(
        argv['vcpkg-root']
    );
    configurationParser.Config['save-dev'] = argv[
        'save-dev'
    ]
        ? 'dev-dependencies'
        : 'dependencies';
    configurationParser.Config.triplet = argv.triplet;

    // Generate Schema
    await Promise.all([
        await AddToolchainPathToTopLevelCMakeLists(
            vcpkgManifest.DirName
        ),
        // Generate Default if No Configuration Found
        configurationParser.WriteDefaultIfNotExists()
    ]);
}
