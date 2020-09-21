#!/usr/bin/env node
import type { ReleaseType } from 'semver';

import ExecVCPKg from './vcpkg';

import GoldPKGArgs from './args';

import Show from './util/show';
import vcpkgManifest from './parser/VCPkgManifest';
import Bootstrap from './vcpkg/Bootstrap';

import LoadParser from './parser/LoadParser';

import { DEFAULT_EMPTY_STDOUT } from './constants';
import PathToCMakeToolChain from './vcpkg/CMakeToolchain';
import InitSampleCode from './cmd/InitSampleCode';
import RunVCPKG from './vcpkg/run';

(async (): Promise<
    Partial<typeof DEFAULT_EMPTY_STDOUT>
> => {
    const argv = GoldPKGArgs;

    await LoadParser(argv);

    if (argv.bootstrap != null) {
        // This Prints on it's own to STDOut
        return await Bootstrap([...argv._]);
    }
    if (argv.versupgrade != null) {
        const release = argv.versupgrade as ReleaseType;
        const version = await vcpkgManifest.UpgradeVersion(
            release
        );
        return {
            stdout: `New version is at ${version}`
        };
    }
    if (argv['cmake-toolchain'] != null)
        return { stdout: PathToCMakeToolChain() };
    if (argv.init != null) {
        return await InitSampleCode(
            argv.init ?? 'Samples',
            ...argv._
        );
    }
    if (argv.vcpkg != null && argv.vcpkg.length !== 0)
        return await RunVCPKG([...argv._, ...argv.vcpkg]);
    return await ExecVCPKg([...argv._]);
})()
    .then(({ stdout = '', stderr = '', show = true }) => {
        if (show === true) {
            if (stdout !== '') Show('message', stdout);
            if (stderr !== '') Show('error', stderr);
        }
        return null;
    })
    .catch((err) =>
        Show('error', err, err.stdout, err.stderr)
    );
