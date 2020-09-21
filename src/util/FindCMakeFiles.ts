import glob from 'fast-glob';
import { existsSync } from 'fs';
import { lstat } from 'fs/promises';
import { ToPosixPath } from '.';
import configurationParser from '../parser/ConfigurationManager';
import { IgnoredFiles } from './Git';

async function FindAllFilesByGlobs(sources: string[]) {
    const files = await glob(sources, {
        ignore: [
            '.git',
            '.vcpkg',
            ...(await IgnoredFiles())
        ],
        dot: true
    });
    return files;
}

export default async function FindCMakeFiles() {
    let source = ToPosixPath(
        String(configurationParser.Config.cmake)
    ).trim();
    if (source !== '') {
        if (!existsSync(source))
            source = `${source}/**/CMakeLists.txt`;
        else {
            const stats = await lstat(source);
            if (stats.isDirectory())
                source = `${source}/**/CMakeLists.txt`;
        }
    }
    if (source.length === 0) source = '**/CMakeLists.txt';
    return await FindAllFilesByGlobs([source]);
}
