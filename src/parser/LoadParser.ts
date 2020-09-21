import type GoldPKGArgs from '../args';
import CMakeParser from './CMakeParser';
import configurationParser from './ConfigurationManager';
import vcpkgManifest from './VCPkgManifest';

export default async function LoadParser(
    argv: typeof GoldPKGArgs
) {
    await Promise.all([
        configurationParser.LoadFile(argv['package-json']),
        vcpkgManifest.LoadFile(argv['vcpkg-json'])
    ]);
    // Update the Local CMake File
    // Add ToolChain Path
    const defaultTopLevelCMakeToolChain = new CMakeParser();
    await defaultTopLevelCMakeToolChain.LoadFile(
        vcpkgManifest.DirName
    );

    configurationParser.Config.cmake = argv.cmake ?? '';

    configurationParser.Config['vcpkg-dir'] =
        argv['vcpkg-dir'];
    configurationParser.Config['save-dev'] = argv[
        'save-dev'
    ]
        ? 'dev-dependencies'
        : 'dependencies';
    configurationParser.Config.triplet = argv.triplet;

    // Save the path to our VCPKG CMake ToolChain File
    defaultTopLevelCMakeToolChain.setCMakeToolChainLine();

    await Promise.all([
        defaultTopLevelCMakeToolChain.Save(),
        // Generate Default if No Configuration Found
        configurationParser.WriteDefault()
    ]);
}
