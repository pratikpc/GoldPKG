import RunCommandAsStream from '../cmd';
import Bootstrap from '../vcpkg/Bootstrap';
async function RunGit(
    commands: string[],
    streamOutputToUserOnScreen = true
) {
    return RunCommandAsStream(
        'git',
        ['--no-pager', ...commands],
        null,
        streamOutputToUserOnScreen
    );
}

export async function CloneRepo(
    repo: string,
    localPath: string,
    ...args: string[]
) {
    return await RunGit([
        'clone',
        repo,
        '--recursive',
        ...args,
        localPath
    ]);
}

export async function UpdateVCPKgSubmodule() {
    await RunGit([
        'submodule',
        'update',
        '--init',
        '--recursive',
        '--remote',
        '--merge',
        '.vcpkg'
    ]);

    return await Bootstrap();
}

export async function IgnoredFiles() {
    function Preprocess(arr: string[] | string[][]) {
        // Merge All Values into One
        let results = ([] as string[]).concat(...arr);
        results = Array.from(new Set<string>(results));
        results = results.filter(
            (command) => !/^--*?/.test(command)
        );
        // Trim the String and Remove Empty String
        results = results.map((line) => line.trim());
        // Remove Empty String and Comments
        results = results.filter(
            (line) => line.length > 0 && line[0] !== '#'
        );
        results = results.map((line) => `${line}/**`);
        results = results.map((line) =>
            line.replace(/(\\|\/\/)/g, '/')
        );
        return results;
    }

    return Preprocess(
        (
            await RunGit(
                ['status', '--ignored', '-s'],
                false
            )
        ).stdout
            .split('\n')
            .map((file) => file.trim())
            .filter((file) => file.startsWith('!!'))
            .map((file) => file.trim().substring(3).trim())
    );
}
