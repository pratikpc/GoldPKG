import {
    DEFAULT_EMPTY_STDOUT,
    LIBNAME
} from '../constants';
import CMakeParser from '../parser/CMakeParser';
import Show from '../util/show';
import configurationParser from '../parser/ConfigurationManager';
import {
    ExtractCMakeFindTargetCalls,
    ManifestInstall,
    InstallProvidedPackages
} from './common';
import vcpkgManifest from '../parser/VCPkgManifest';
import FindCMakeFiles from '../util/FindCMakeFiles';

// Uses the Manifest to Perform Install
export default async function Install(
    commands_: string[] = []
) {
    // Warn user to set Correct Triplet
    if (configurationParser.Triplet == null)
        Show(
            'message',
            `Remember to set TRIPLET Correctly`
        );
    const commands = commands_
        // Remove all Package names from here
        // Commands always start with -/hyphen
        .filter((command) => command.startsWith('-'));

    // Run in Manifest Mode
    const manifestInstallResults = await ManifestInstall(
        commands
    );
    // If an Error has occured,
    // Early Return
    if (manifestInstallResults.stderr.trim() !== '')
        return DEFAULT_EMPTY_STDOUT;

    const [
        simpleInstallOfPackagesResults,
        pkgProvided
    ] = await InstallProvidedPackages(commands_, true);

    if (simpleInstallOfPackagesResults.stderr.trim() !== '')
        return DEFAULT_EMPTY_STDOUT;

    if (pkgProvided.length !== 0) {
        await vcpkgManifest.AddPackages(pkgProvided);
        Show(
            'message',
            `Installation of ${pkgProvided} successful. ${vcpkgManifest.FilePath} was updated`
        );
    }
    // Extract all CMake Information
    // We need to add to CMakeFile
    const {
        find,
        target
    } = await ExtractCMakeFindTargetCalls(
        simpleInstallOfPackagesResults.stdout
    );

    if (find.length !== 0 || target.length !== 0) {
        Show('message', 'ADD to CMake via');
        Show(
            'message',
            `
${find.join('\n')}

${target.join('\n')}
    `
        );
    }
    if (String(configurationParser.Config.cmake) !== '') {
        // Find All CMake Files
        let cmakeFiles = (await FindCMakeFiles()).map(
            (cmakeFile) => new CMakeParser(cmakeFile)
        );

        if (cmakeFiles.length !== 0) {
            if (pkgProvided.length === 0) {
                Show(
                    'error',
                    'Please provide package-names to add to CMake'
                );
                Show(
                    'error',
                    'By default, we refuse to add all CMake Packages to a file even if we could',
                    "It's really easy to implement from our side. But we'd prefer if your CMakeLists were modular"
                );
                Show(
                    'error',
                    `To Add Packages to your CMakeLists.txt, specify your path to CMake Using
            ${LIBNAME} install <pkg-name-if-empty-add-all> --cmake <CMAKE FILE>`
                );
                return DEFAULT_EMPTY_STDOUT;
            }

            if (find.length === 0 && target.length === 0)
                return DEFAULT_EMPTY_STDOUT;

            // Load all CMake Files
            await Promise.all(
                cmakeFiles.map((cmakeFile) =>
                    cmakeFile.LoadFile()
                )
            );
            // Modify and Add Dependencies to the CMake Files
            for (const cmakeFile of cmakeFiles) {
                cmakeFile.InsertFindAndTarget(find, target);
            }
            // Ignore all Unchanged Files
            cmakeFiles = cmakeFiles.filter(
                (cmakeFile) => cmakeFile.Changes
            );

            // Save all Changed Files
            await Promise.all(
                cmakeFiles.map((cmakeFile) =>
                    cmakeFile.Save()
                )
            );

            for (const cmakeFile of cmakeFiles) {
                Show(
                    'message',
                    `CMake At ${cmakeFile.FilePath} was updated`
                );
            }
        }
    }
    return manifestInstallResults;
}
