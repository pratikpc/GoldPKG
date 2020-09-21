import { spawn } from 'child_process';
import { red, white } from 'colors/safe';
import path from 'path';

import { DEFAULT_EMPTY_STDOUT } from '../constants';
import Show from '../util/show';

// export async function execCmdInDir(
//     folder: Readonly<string>,
//     app: Readonly<string>,
//     commands: readonly string[] = []
// ) {
//     const command = `cd ${folder} && ${app} ${commands.join(
//         ' '
//     )} && cd ${process.cwd()}`;
//     return await promisify(exec)(command);
// }
export default async function RunCommandAsStream(
    app: string,
    commands_: readonly string[] = [],
    folder: string | null = null,
    streamOutputToUserOnScreen = true
) {
    const commands = commands_
        .map((command) => command.trim())
        .filter((command) => command.length > 0);

    let output = DEFAULT_EMPTY_STDOUT;
    let error: Error | null = null;
    try {
        const appPath =
            folder == null
                ? app
                : path.resolve(
                      path.join(folder ?? '', app)
                  );
        // console.log(`${appPath} ${commands.join(' ')}`);

        output = await new Promise<
            typeof DEFAULT_EMPTY_STDOUT
        >((resolve, reject) => {
            let stdout = '';
            let stderr = '';
            const run = spawn(appPath, commands);
            run.stdout.on('data', (data: Buffer) => {
                if (streamOutputToUserOnScreen)
                    process.stdout.write(
                        white(data.toString())
                    );
                stdout += data;
            });
            run.on('error', (err) => reject(err));
            run.stderr.on('data', (data: Buffer) => {
                if (streamOutputToUserOnScreen)
                    process.stderr.write(
                        red(data.toString())
                    );
                stderr += data;
            });
            run.on('close', (code) => {
                if (code !== 0) reject(new Error(stderr));
                else
                    resolve({
                        stdout: stdout,
                        stderr: stderr,
                        // If the Output has already been outputted to the screen
                        // Do not Output it again
                        show: !streamOutputToUserOnScreen
                    });
            });
        });
    } catch (err) {
        Show('error', err);
        error = err;
    }
    if (error != null) throw error;
    return output;
}
