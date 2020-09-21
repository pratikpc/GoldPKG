import { existsSync } from 'fs';
import { join } from 'path';
import configurationParser from '../parser/ConfigurationManager';
import vcpkgManifest from '../parser/VCPkgManifest';
import RunCommandAsStream from '../cmd';
import Bootstrap from './Bootstrap';

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
    if (!existsSync(join(vcpkgPath, app)))
        await Bootstrap();
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
                : '',
            // Experimental/Documented Switch as of Writing
            // Enable Both
            manifestMode
                ? `--x-manifest-root=${manifestDir}`
                : '',
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
