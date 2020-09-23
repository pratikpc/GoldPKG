import { existsSync } from 'fs';

import configurationParser from '../parser/ConfigurationManager';
import RunCommandAsStream from '../cmd';
import { LIBNAME } from '../constants';

export default async function Bootstrap(
    commands: string[] = []
) {
    const file = 'bootstrap-vcpkg';
    // If Windows, run the Batch Script
    // Or Else run the Linux script
    const fileName =
        process.platform === 'win32'
            ? `${file}.bat`
            : `./${file}.sh`;
    const vcpkgPath = String(
        configurationParser.Config['vcpkg-dir']
    );
    if (!existsSync(vcpkgPath))
        return {
            stdout: '',
            stderr: `VCPKG not found at ${vcpkgPath}
Specify using --vcpkg-path option
It's quite possible you have not initialized the repo
Run ${LIBNAME} --init`,
            show: true
        };
    return await RunCommandAsStream(
        fileName,
        [
            ...(configurationParser.Config
                .Bootstrap as string[]),
            ...commands
        ],
        String(configurationParser.Config['vcpkg-dir'])
    );
}
