import { xor } from 'lodash';

import { DEFAULT_EMPTY_STDOUT } from '../constants';
import CMakeParsers from '../parser/CMakeParsers';
import vcpkgManifest from '../parser/VCPkgManifest';
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
    const cmakeFiles = new CMakeParsers();

    await cmakeFiles.OpenFiles();
    await cmakeFiles.LoadFiles();

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

    cmakeFiles.InsertFindAndTarget(
        [], // We are not Adding Packages Here
        [],
        // Just removing existing packages
        removeFinds,
        removeTargets
    );

    cmakeFiles.IgnoreUnchangedOnly();

    await cmakeFiles.Save();

    for (const cmakeFile of cmakeFiles.FileNames) {
        Show(
            'message',
            `Removed ${pkgNames.join(
                ' '
            )} from ${cmakeFile}`
        );
    }
}

export default async function Remove(commands_: string[]) {
    if (
        !vcpkgManifest.Exists ||
        !(await vcpkgManifest.IsFile)
    )
        return {
            stdout: '',
            stderr: 'VCPKG Manifest Not Found',
            show: true
        };

    // Retain Commands only
    const pkgNames = commands_.filter(
        (pkg) => !pkg.startsWith('-')
    );

    const commands = xor(pkgNames, commands_);

    // If No Packages Specified
    // Do Nothing
    if (pkgNames.length === 0) {
        return {
            stdout: '',
            stderr: 'No Package to Remove Specified',
            show: true
        };
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
