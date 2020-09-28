import path from 'path';

import configurationParser from '../parser/ConfigurationManager';
import { ToPosixPath } from '../util';

export default function PathToCMakeToolChain() {
    return ToPosixPath(
        path.resolve(
            path.join(
                String(
                    configurationParser.Config['vcpkg-root']
                ),
                'scripts',
                'buildsystems',
                'vcpkg.cmake'
            )
        )
    );
}
