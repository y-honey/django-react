import * as fs from "fs";
import * as core from '@aws-cdk/core';
import {IHostedZone, PublicHostedZone} from "@aws-cdk/aws-route53";
import {Source} from "@aws-cdk/aws-s3-deployment";

import {EnvConstructProps} from "../../types";
import {WebAppCloudFrontDistribution} from "../../patterns/webAppCloudFrontDistribution";
import {Bucket, BucketAccessControl, HttpMethods} from "@aws-cdk/aws-s3";
import {DnsValidatedCertificate, ICertificate} from "@aws-cdk/aws-certificatemanager";


export interface GlobalToolsStackProps extends core.StackProps, EnvConstructProps {
}

export class GlobalToolsStack extends core.Stack {
    private versionMatrixCloudFrontDistribution: WebAppCloudFrontDistribution;

    constructor(scope: core.App, id: string, props: GlobalToolsStackProps) {
        super(scope, id, props);

        const domainZone = PublicHostedZone.fromHostedZoneAttributes(this, "DomainZone", {
            hostedZoneId: props.envSettings.toolsHostedZone.id,
            zoneName: props.envSettings.toolsHostedZone.name,
        });

        const domainName = props.envSettings.toolsHostedZone.name;
        const certificate = new DnsValidatedCertificate(this, "ToolsCertificate", {
            region: 'us-east-1',
            domainName: domainName,
            subjectAlternativeNames: [`*.${domainName}`],
            hostedZone: domainZone
        });

        this.createVersionMatrixTool(props, domainZone, certificate);
    }

    private createVersionMatrixTool(props: GlobalToolsStackProps, domainZone: IHostedZone, certificate: ICertificate) {
        new Bucket(this, "VersionMatrixBucket", {
            bucketName: `${props.envSettings.projectName}-version-matrix`,
            publicReadAccess: true,
            accessControl: BucketAccessControl.PUBLIC_READ,
            cors: [{
                allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
                allowedOrigins: [`https://${props.envSettings.domains.versionMatrixDomain}`],
            }]
        })

        const filesPath = `${props.envSettings.projectRootDir}/tools/version-matrix/build`;
        if (fs.existsSync(filesPath)) {
            this.versionMatrixCloudFrontDistribution = new WebAppCloudFrontDistribution(this, "WebApp", {
                sources: [Source.asset(filesPath)],
                domainZone,
                domainName: props.envSettings.domains.versionMatrixDomain,
                certificateArn: certificate.certificateArn,
            });
        }
    }
}
