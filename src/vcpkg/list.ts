import vcpkgManifest from '../parser/VCPkgManifest';
// Check all Packages installed by user in Module
// Crosscheck by Packages mentioned in vcpkg.json

import RunVCPKG from './run';

// Run dry-run installs for them
export type VCPKgInstalledPackages = {
    package_name: string;
    triplet: string;
};

// Sample Output style
// {
//     "boost-array:x86-windows": {
//       "package_name": "boost-array",
//       "triplet": "x86-windows",
//       "version": "1.73.0",
//       "port_version": 0,
//       "features": [],
//       "desc": [
//         "Boost array module"
//       ]
//     }
// }
async function Json() {
    const { stdout: packageListString } = await RunVCPKG(
        [
            'list',
            // Get output as JSON
            '--x-json'
        ],
        // Run List command in Manifest Mode
        true,
        // Do Not Stream the Output
        false
    );
    try {
        return JSON.parse(packageListString) ?? {};
    } catch (err) {
        return {};
    }
}
async function ListAllDependencies(): Promise<
    VCPKgInstalledPackages[]
> {
    const packagesInstalled = Object.values(await Json());
    return packagesInstalled as VCPKgInstalledPackages[];
}
/// Use this function to
/// Extract all of the Packages Installed and their Triplet Info
export async function InstalledPackagesList(): Promise<
    VCPKgInstalledPackages[]
> {
    // This generates a List of All Packages Installed
    // Irrespective of the User's Interest Levels in these packages
    const allPackagesInstalled = await ListAllDependencies();
    // These are the packages which could be installed
    // Due to platform issues, some won't be
    // We use this code to find out the Core Packages the User uses
    const dependencies = await vcpkgManifest.DependencyNames;

    // Use this to remove the packages that the
    // user wanted but could not install due to platform issues
    const packagesInstalled = allPackagesInstalled.filter(
        (packageV) =>
            dependencies.includes(packageV.package_name)
    );

    return packagesInstalled;
}

export async function ListDependencies() {
    const deps = await InstalledPackagesList();
    return deps.map((dep) => `${dep.package_name}`);
}
