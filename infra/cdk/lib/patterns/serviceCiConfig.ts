import {Construct} from "constructs";
import {BuildEnvironmentVariable} from "aws-cdk-lib/aws-codebuild/lib/project";

import {EnvConstructProps} from "../types";
import {BuildEnvironmentVariableType} from "aws-cdk-lib/aws-codebuild";

export interface IServiceCiConfig {
    defaultEnvVariables: {
        [name: string]: BuildEnvironmentVariable;
    };
}


export class ServiceCiConfig extends Construct implements IServiceCiConfig {
    defaultEnvVariables: { [p: string]: BuildEnvironmentVariable };
    defaultCachePaths: string[];

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.defaultEnvVariables = {
            CI: {type: BuildEnvironmentVariableType.PLAINTEXT, value: 'true'},
            PROJECT_NAME: {type: BuildEnvironmentVariableType.PLAINTEXT, value: props.envSettings.projectName},
            ENV_STAGE: {type: BuildEnvironmentVariableType.PLAINTEXT, value: props.envSettings.envStage},
        };

        this.defaultCachePaths = [
            'infra/cdk/node_modules/**/*',
            'infra/functions/node_modules/**/*',
            'scripts/node_modules/**/*',
            '/root/.cache/pip/',
            '/root/.cache/pipenv/',
        ]
    }
}



