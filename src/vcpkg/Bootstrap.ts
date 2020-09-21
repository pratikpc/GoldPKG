import configurationParser from '../parser/ConfigurationManager';
import RunCommandAsStream from '../cmd';

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
