import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvConstructProps, ServiceCiConfig } from '@sb/infra-core';

interface WebAppCiConfigProps extends EnvConstructProps {
  inputArtifact: codepipeline.Artifact;
  buildStage: codepipeline.IStage;
  deployStage: codepipeline.IStage;
}

export class WebappCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: WebAppCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildArtifact = codepipeline.Artifact.artifact(
      `${props.envSettings.projectEnvName}-webapp`
    );

    const buildProject = this.createBuildProject(props);
    props.buildStage.addAction(
      this.createBuildAction(
        {
          project: buildProject,
          input: props.inputArtifact,
          outputs: [buildArtifact],
        },
        props
      )
    );

    const deployProject = this.createDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        {
          project: deployProject,
          input: buildArtifact,
          runOrder: 2,
        },
        props
      )
    );
  }

  private createBuildAction(
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: WebAppCiConfigProps
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-build-webapp`,
    });
  }

  private createBuildProject(props: WebAppCiConfigProps) {
    const configEnvVariables = Object.assign(
      {},
      ...Object.keys(props.envSettings.webAppEnvVariables).map((k) => ({
        [k]: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.webAppEnvVariables[k],
        },
      }))
    );

    const project = new codebuild.Project(this, 'WebAppBuildProject', {
      projectName: `${props.envSettings.projectEnvName}-build-webapp`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'go get github.com/segmentio/chamber',
              'npm i -g nx@^15.4.5 pnpm@^8.6.1',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=webapp...`,
            ],
          },
          build: {
            commands: [
              'nx run webapp:lint',
              'nx run webapp:test --watchAll=false',
              'nx run webapp:build',
            ],
          },
        },
        cache: {
          paths: this.defaultCachePaths,
        },
        artifacts: {
          files: ['**/*'],
          'exclude-paths': ['./**/node_modules', './**/node_modules/**/*'],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        ...configEnvVariables,
        VITE_ENVIRONMENT_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.envStage,
        },
      },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER),
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['kms:*', 'ssm:*'],
        resources: ['*'],
      })
    );

    return project;
  }

  private createDeployAction(
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: WebAppCiConfigProps
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-deploy-webapp`,
    });
  }

  private createDeployProject(props: WebAppCiConfigProps) {
    const stack = Stack.of(this);
    const project = new codebuild.Project(this, 'WebAppDeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-webapp`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'npm i -g nx@^15.4.5 pnpm@^8.6.1',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=webapp...`,
            ],
          },
          build: { commands: ['nx run webapp:deploy'] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environmentVariables: { ...this.defaultEnvVariables },
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_6_0 },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-WebAppStack/*`,
        ],
      })
    );

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:*',
          'sts:*',
          'cloudfront:*',
          's3:*',
          'ecs:*',
          'lambda:*',
          'route53:*',
        ],
        resources: ['*'],
      })
    );

    return project;
  }
}
