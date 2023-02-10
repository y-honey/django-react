import * as fs from 'fs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import {
  EnvConstructProps,
  getHostedZone,
  getCloudfrontCertificateArn,
} from '@saas-boilerplate-app/infra-core';
import {
  UsEastResourcesStack,
  WebAppCloudFrontDistribution,
} from '@saas-boilerplate-app/infra-shared';

export interface DocsStackProps extends StackProps, EnvConstructProps {}

export class DocsStack extends Stack {
  webAppCloudFrontDistribution?: WebAppCloudFrontDistribution;

  constructor(scope: App, id: string, props: DocsStackProps) {
    super(scope, id, props);

    const domainZone = getHostedZone(this, props.envSettings);
    const certificateArn = getCloudfrontCertificateArn(props.envSettings);

    const filesPath = `${__dirname}/../../..//build`;
    console.log(filesPath)
    if (fs.existsSync(filesPath)) {
      this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(
        this,
        'DocsWebApp',
        {
          sources: [s3Deployment.Source.asset(filesPath)],
          domainZone,
          domainName: props.envSettings.domains.docs,
          apiDomainName: props.envSettings.domains.api,
          certificateArn,
          authLambdaSSMParameterName:
            UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(
              props.envSettings
            ),
          distributionPaths: ['/*'],
        }
      );
    }
  }
}
