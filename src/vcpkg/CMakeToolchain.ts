import path from 'path';

import configurationParser from '../parser/ConfigurationManager';

export default function PathToCMakeToolChain() {
    return path.resolve(
        path.join(
            String(
                configurationParser.Config['vcpkg-root']
            ),
            'scripts',
            'buildsystems',
            'vcpkg.cmake'
        )
    );
}
