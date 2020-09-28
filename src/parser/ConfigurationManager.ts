import { LIBNAME } from '../constants';
import { DependencyKeyManifest } from '../constants/types';
import BaseParser from './BaseParser';

// Store Package Conf in Package.json
export const DEFAULT_PACKAGE_CONF = {
    Bootstrap: [] as string[],
    VCPkg: [] as string[]
};

class ConfigurationParser extends BaseParser {
    public Config: Record<
        string,
        unknown
    > = DEFAULT_PACKAGE_CONF;

    constructor(FilePath?: string) {
        super(`.${LIBNAME}.json`, FilePath);
    }

    public async LoadFile(FilePath?: string) {
        await super.LoadFile(FilePath);
        if (this.Exists)
            this.Config = await this.ReadJson.then(
                async (json) =>
                    (json ??
                        DEFAULT_PACKAGE_CONF) as typeof DEFAULT_PACKAGE_CONF
            );
    }

    public async LoadFile(FilePath?: string) {
        await super.LoadFile(FilePath);
        if (this.Exists && (await this.IsFile))
            this.Config = await this.ReadJson;
    }

    public get VCPKGConfig() {
        return (this.Config.VCPKg ?? []) as string[];
    }

    // Generate Schema
    public async WriteDefault() {
        if (this.Exists) return;
        await this.WriteJson(DEFAULT_PACKAGE_CONF);
    }

    public get DependencyKey(): DependencyKeyManifest {
        return this.Config[
            'save-dev'
        ] as DependencyKeyManifest;
    }

    // Get the VCPKg Triplet Value set by User
    public get Triplet(): string | null {
        // By Default triplet can be null
        const { triplet: tripletOrNull } = this.Config;
        // If it is Null, Return Null
        if (tripletOrNull == null) return null;
        // If Not convert to string
        const triplet = String(tripletOrNull).trim();
        // If Empty, Return Null
        if (triplet === '') return null;
        return triplet;
    }
}
const configurationParser = new ConfigurationParser();
export default configurationParser;
