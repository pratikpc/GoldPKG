import { xor } from 'lodash';
import { DEFAULT_EMPTY_STDOUT } from '../constants';
import CMakeParser from '../parser/CMakeParser';
import vcpkgManifest from '../parser/VCPkgManifest';
import FindCMakeFiles from '../util/FindCMakeFiles';
import Show from '../util/show';
import {
    ExtractCMakeFindTargetCalls,
    ManifestInstall,
    InstallProvidedPackages
} from './common';

async function RemovePackagesFromCMakeFileIfProvided(
    pkgNames: string[]
) {
    // Find All CMake Files
    let cmakeFiles = (await FindCMakeFiles()).map(
        (cmakeFile) => new CMakeParser(cmakeFile)
    );
    // Load all CMake Files
    await Promise.all(
        cmakeFiles.map((cmakeFile) => cmakeFile.LoadFile())
    );

    const [cmdSimpleOut] = await InstallProvidedPackages(
        pkgNames,
        false
    );

    // If Error, Do Not Proceed any Further
    if (cmdSimpleOut.stderr !== '') return;

    const {
        find: removeFinds,
        target: removeTargets
    } = await ExtractCMakeFindTargetCalls(
        cmdSimpleOut.stdout
    );
    Show(
        'message',
        `
Removed
${removeFinds.join('\n')}
${removeTargets.join('\n')}`
    );

    for (const cmakeFile of cmakeFiles) {
        cmakeFile.InsertFindAndTarget(
            [], // We are not Adding Packages Here
            [],
            // Just removing existing packages
            removeFinds,
            removeTargets
        );
    }

    // Ignore all Unchanged Files
    cmakeFiles = cmakeFiles.filter(
        (cmakeFile) => cmakeFile.Changes
    );

    // Save all Changed Files
    await Promise.all(
        cmakeFiles.map((cmakeFile) => cmakeFile.Save())
    );

    for (const cmakeFile of cmakeFiles) {
        Show(
            'message',
            `Removed ${pkgNames.join(' ')} from ${
                cmakeFile.FilePath
            }`
        );
    }
}

export default async function Remove(commands_: string[]) {
    // Retain Commands only
    const pkgNames = commands_.filter(
        (pkg) => !pkg.startsWith('-')
    );

    const commands = xor(pkgNames, commands_);

    // If No Packages Specified
    // Do Nothing
    if (pkgNames.length === 0) {
        Show('error', 'No Package to Remove Specified');
        return DEFAULT_EMPTY_STDOUT;
    }

    await vcpkgManifest.RemovePackages(pkgNames);

    await RemovePackagesFromCMakeFileIfProvided(pkgNames);

    Show(
        'message',
        `Manifest At ${vcpkgManifest.FilePath} was updated`
    );
    Show('message', `Performing Reinstall`);
    await ManifestInstall(commands, false);

    // It's not Implemented Yet by VCPKG :-P
    // try {
    //     await Run(
    //         ['remove'],
    //         // Manifest Mode
    //         true,
    //         // Show Output to user
    //         true
    //     );
    // } catch (err) {
    //     // This Exception will always be thrown
    //     // Because vcpkg remove is yet to be implemented
    // }

    return DEFAULT_EMPTY_STDOUT;
}
