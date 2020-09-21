import { DEFAULT_EMPTY_STDOUT } from '../constants';
import {
    FIND_CMAKE_REGEX,
    TARGET_CMAKE_REGEX
} from '../constants/regex';
import Show from '../util/show';
import RunVCPKG from './run';

export async function ManifestInstall(
    commands: string[],
    streamOutputToScreen = true
) {
    return await RunVCPKG(
        ['install', ...commands],
        true,
        streamOutputToScreen
    );
}

export async function InstallProvidedPackages(
    commands: string[],
    outputToScreen = false
): Promise<[typeof DEFAULT_EMPTY_STDOUT, string[]]> {
    // Package Names do not start with Hyphen
    // But Commands Do
    const pkgProvided = commands.filter(
        (command) => !command.startsWith('-')
    );
    // If No Package Present, Do Nothing
    if (pkgProvided.length === 0) {
        return [DEFAULT_EMPTY_STDOUT, []];
    }
    if (outputToScreen)
        Show(
            'message',
            `Installing New Package ${pkgProvided}. Not Running in Manifest Mode`
        );
    const cmdOut = await RunVCPKG(
        ['install', ...commands],
        // Does not Run IN Manifest Mode
        // This is because we want the CMake Output
        // Which we don't get in Manifest Mode
        false,
        // Output to Screen
        outputToScreen
    );

    return [cmdOut, pkgProvided];
}

export async function ExtractCMakeFindTargetCalls(
    source: string
) {
    const vcpkgOutput = source
        .split('\n')
        .map((line) => line.trim())
        // Ignore the Small Lines
        // This Number can be comparitively bigger
        .filter((line) => line.length >= 7);

    // Extract Find_* commands
    const find = vcpkgOutput.filter((line) =>
        FIND_CMAKE_REGEX.test(line)
    );
    // Extract target_* commands
    const target = vcpkgOutput
        .filter((line) => TARGET_CMAKE_REGEX.test(line))
        // Change Name of Project
        // By Default vcpkg sets Package Name as Main
        // They should use ${PROJECT_NAME} instead
        .map((line) =>
            line.replace('(main', `(\${PROJECT_NAME}`)
        );
    return {
        find: find,
        target: target
    };
}
