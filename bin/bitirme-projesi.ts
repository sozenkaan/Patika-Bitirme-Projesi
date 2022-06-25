#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BitirmeProjesiStack } from '../lib/bitirme-projesi-stack';
import { PatikaVpcStack } from '../lib/vpc';
import { PatikaCloudStack } from '../lib/cloud-front';


import { getConfig } from '../lib/config';

const app = new cdk.App();
const conf = getConfig(app);
const env = {
  account: conf.account,
  region: conf.region,
};


new PatikaCloudStack(app, 'PatikaCloudStack', { env });
new PatikaVpcStack(app, 'PatikaVpcStack', { env });





