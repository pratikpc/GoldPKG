import { resolve } from 'path';
import yargs from 'yargs';
import { VCPKG_DIR } from './constants';

const GoldPKGArgs = yargs
    .parserConfiguration({
        'unknown-options-as-args': true,
        'short-option-groups': true,
        'camel-case-expansion': true
    })
    .help('help')
    .options({
        bootstrap: {
            requiresArg: false,
            array: true,
            description: 'Bootstrap VCPKG'
        },
        'config-json': {
            requiresArg: true,
            string: true,
            number: false,
            description:
                'Provide Path to Package.json. By Default, Looks in Current Directory',
            default: resolve('.')
        },
        cmake: {
            requiresArg: true,
            string: true,
            number: false,
            nargs: 1,
            description:
                'Provide Path to CMakeLists.txt. The Path is a Glob'
        },
        'vcpkg-json': {
            requiresArg: true,
            string: true,
            number: false,
            description:
                'Provide Path to vcpkg.json. By Default, Looks in Current Directory',
            default: resolve('.')
        },
        'vcpkg-root': {
            requiresArg: true,
            string: true,
            number: false,
            description:
                'Provide Path to VCPkg. By Default, Looks in Current Directory or Configuration File',
            default: VCPKG_DIR
        },
        'save-dev': {
            alias: 'dev',
            requiresArg: false,
            description:
                'Save New Package to Dev Dependencies in Manifest'
        },
        'cmake-toolchain': {
            description:
                'Get the Path to the VCPKG ToolChain',
            requiresArg: false
        },
        // Need to override triplet because triplet passes by space not assignment
        // --triplet <triplet> and not --triplet=<triplet>
        // Passing by Assignment remains the convention elsewhere in VCPkg
        triplet: {
            requiresArg: true,
            string: true,
            number: false,
            description: 'Set the VCPKG Triplet'
        },
        versupgrade: {
            requiresArg: true,
            nargs: 1,
            number: false,
            description: 'Semver updates of Manifest',
            choices: [
                'major',
                'premajor',
                'minor',
                'preminor',
                'patch',
                'prepatch',
                'prerelease'
            ]
        },
        init: {
            requiresArg: false,
            string: true,
            description: `Name the Directory to Initialize the Project`
        },
        vcpkg: {
            array: true,
            requiresArg: true,
            string: true,
            description:
                'Pass Commands directly to VCPKG instead of using our Overloads'
        }
    })
    .parserConfiguration({
        'unknown-options-as-args': true,
        'short-option-groups': true,
        'camel-case-expansion': true
    }).argv;

export default GoldPKGArgs;
