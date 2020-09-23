import {
    DEFAULT_EMPTY_STDOUT,
    LIBNAME
} from '../constants';
import Show from '../util/show';
import configurationParser from '../parser/ConfigurationManager';
import {
    ExtractCMakeFindTargetCalls,
    ManifestInstall,
    InstallProvidedPackages
} from './common';
import vcpkgManifest from '../parser/VCPkgManifest';
import CMakeParsers from '../parser/CMakeParsers';

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
        return manifestInstallResults;

    const [
        simpleInstallOfPackagesResults,
        pkgProvided
    ] = await InstallProvidedPackages(commands_, true);

    if (simpleInstallOfPackagesResults.stderr.trim() !== '')
        return simpleInstallOfPackagesResults;

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
        const cmakeFiles = new CMakeParsers();
        await cmakeFiles.OpenFiles();

        if (cmakeFiles.length !== 0) {
            if (pkgProvided.length === 0) {
                return {
                    stdout: '',
                    stderr: `Please provide package-names to add to CMake
By default, we refuse to add all CMake Packages to a file even if we could
You can do it by passing --cmake * in the command line
To Add Packages to your CMakeLists.txt, specify your path to CMake Using 
${LIBNAME} install <pkg-name-if-empty-add-all> --cmake <CMAKE FILE>`,
                    show: true
                };
            }

            if (find.length === 0 && target.length === 0)
                return DEFAULT_EMPTY_STDOUT;

            // Load all CMake Files
            await cmakeFiles.LoadFiles();
            cmakeFiles.InsertFindAndTarget(find, target);

            cmakeFiles.IgnoreUnchangedOnly();

            // Save all Changed Files
            await cmakeFiles.Save();

            for (const cmakeFile of cmakeFiles.FileNames) {
                Show(
                    'message',
                    `CMake At ${cmakeFile} was updated`
                );
            }
        }
    }
    return manifestInstallResults;
}
