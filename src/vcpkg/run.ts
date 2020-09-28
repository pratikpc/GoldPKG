import { existsSync } from 'fs';
import { join } from 'path';
import configurationParser from '../parser/ConfigurationManager';
import vcpkgManifest from '../parser/VCPkgManifest';
import RunCommandAsStream from '../cmd';
import Bootstrap from './Bootstrap';
import { LIBNAME } from '../constants';

export default async function RunVCPKG(
    options: readonly string[],
    // By Default. don't use Manifest Mode
    manifestMode = false,
    // Take a decision if User Needs to see the Output or Not
    streamOutputToUserOnScreen = true
) {
    const vcpkgPath = String(
        configurationParser.Config['vcpkg-dir']
    );
    const file = 'vcpkg';
    // If Windows, run the Exe
    // Or Else run the Linux Build
    const app =
        String(process.platform) === 'win32'
            ? `${file}.exe`
            : `./${file}`;
    if (!existsSync(vcpkgPath))
        return {
            stdout: '',
            stderr: `VCPKG not found at ${vcpkgPath}
Specify using --vcpkg-path option
It's quite possible you have not initialized the repo
Run ${LIBNAME} --init`,
            show: true
        };
    if (!existsSync(join(vcpkgPath, app)))
        await Bootstrap();

    // Generate Default if No VCPKG Manifest Found
    await vcpkgManifest.WriteDefaultIfNotExists();

    const manifestDir = vcpkgManifest.DirName;
    return await RunCommandAsStream(
        app,
        [
            ...configurationParser.VCPKGConfig,
            `--vcpkg-root=${vcpkgPath}`,
            // If Manifest Mode is Enabled, Set to Manifest Root Directory
            // Preferably all commands should be run in Manifest Mode but
            // The user may not want it that way
            // We will however try to run install in Manifest Mode
            manifestMode
                ? `--manifest-root-dir=${manifestDir}`
                : // Disable Manifests
                  '--feature-flags=-manifests',
            // Experimental/Documented Switch as of Writing
            // Enable Both
            manifestMode
                ? `--x-manifest-root=${manifestDir}`
                : // Disable Manifests
                  '--feature-flags=-manifests',
            // Enable Support for Triplet Configuration
            ...(configurationParser.Triplet == null
                ? []
                : [
                      `--triplet`,
                      `${configurationParser.Triplet}`
                  ]),
            ...options
        ],
        vcpkgPath,
        streamOutputToUserOnScreen
    );
}
