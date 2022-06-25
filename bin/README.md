### Deploy scripts for ecs cluster
cdk synth --app "npx ts-node bin/patika-computing.ts" PatikaECSClusterStack

cdk deploy --app "npx ts-node bin/patika-computing.ts" PatikaECSClusterStack

### Deploy scripts for ecr stack
cdk synth --app "npx ts-node bin/patika-computing.ts" PatikaBackendECRStack

cdk deploy --app "npx ts-node bin/patika-computing.ts" PatikaBackendECRStack

### Deploy scripts for s3 env vars stack
cdk synth --app "npx ts-node bin/patika-computing.ts" PatikaServicesEnvBucketStack

cdk deploy --app "npx ts-node bin/patika-computing.ts" PatikaServicesEnvBucketStack
