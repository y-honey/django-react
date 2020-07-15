import './types';

export interface EnvironmentSettingsDomains {
    adminPanel: string;
    api: string;
    webApp: string;
    www: string;
    versionMatrixDomain: string;
}

export interface EnvironmentSettingsHostedZone {
    id: string;
    name: string;
}

export interface EnvironmentSettings {
    projectRootDir: string;
    projectName: string;
    projectEnvName: string;
    envStage: string;
    version: string;
    hostedZone: EnvironmentSettingsHostedZone;
    toolsHostedZone: EnvironmentSettingsHostedZone;
    domains: EnvironmentSettingsDomains;
}

export function loadEnvSettings(): EnvironmentSettings {
    const projectName = process.env.PROJECT_NAME;
    const envStage = process.env.ENV_STAGE;

    if (!envStage) {
        throw new Error('Environmental variable ENV_STAGE is undefined!')
    }

    return {
        projectRootDir: process.env.PROJECT_ROOT_DIR,
        projectName: projectName,
        projectEnvName: `${projectName}-${envStage}`,
        envStage: process.env.ENV_STAGE,
        version: process.env.VERSION,
        hostedZone: {
            id: process.env.HOSTED_ZONE_ID,
            name: process.env.HOSTED_ZONE_NAME,
        },
        toolsHostedZone: {
            id: process.env.TOOLS_HOSTED_ZONE_ID,
            name: process.env.TOOLS_HOSTED_ZONE_NAME,
        },
        domains: {
            adminPanel: process.env.ADMIN_PANEL_DOMAIN,
            api: process.env.API_DOMAIN,
            webApp: process.env.WEB_APP_DOMAIN,
            www: process.env.WWW_DOMAIN,
            versionMatrixDomain: process.env.VERSION_MATRIX_DOMAIN,
        },
    };
}
