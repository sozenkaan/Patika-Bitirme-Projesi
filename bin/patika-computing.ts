#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getConfig } from '../lib/config';
import { PatikaECSClusterStack } from '../lib/ecs';
import { PatikaBackendECRStack } from '../lib/ecr';
import { PatikaServicesEnvBucketStack } from '../lib/s3';
import { PatikaECSFargateStack } from '../lib/ecs';


const app = new cdk.App();
const conf = getConfig(app);
const env = {
  account: conf.account,
  region: conf.region,
};

new PatikaECSClusterStack(app, 'PatikaECSClusterStack', { env });
const ecrStack = new PatikaBackendECRStack(app, 'PatikaBackendECRStack', { env });

new PatikaECSFargateStack(app, 'PatikaECSFargateStack', { ecrStack: ecrStack.ecrRepo });
new PatikaServicesEnvBucketStack(app, 'PatikaServicesEnvBucketStack', { env });

