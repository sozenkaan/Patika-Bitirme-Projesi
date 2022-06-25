import { Stack, StackProps, CfnOutput, Fn, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2,aws_s3, aws_ecs, aws_iam, aws_ssm, aws_elasticloadbalancingv2 } from 'aws-cdk-lib';
import { CommonStackProps } from '../common-stack-probs';
import { getConfig } from '../config';


export class PatikaECSFargateStack extends Stack {
    constructor(scope: Construct, id: string, props?: CommonStackProps) {
        super(scope, id, props);

        const conf = getConfig(scope);

        if (props?.ecrStack) {

            const vpc = aws_ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
                vpcId: conf.vpcId,
                availabilityZones: conf.availabilityZones,
                publicSubnetIds: conf.publicSubnetIds,
            });

            const clusterSg = aws_ec2.SecurityGroup.fromSecurityGroupId(this,'PatikaCloudECSClusterSg',Fn.importValue('PatikaECSClusterSgId'));

            const cluster = aws_ecs.Cluster.fromClusterAttributes(this, 'PatikaECSCluster', {
                clusterArn: Fn.importValue('PatikaECSClusterARN'),
                clusterName: Fn.importValue('PatikaECSClusterName'),
                vpc,
                securityGroups: [clusterSg],

            });

            const envBucket = aws_s3.Bucket.fromBucketAttributes(this, 'PatikaServicesEnvBucket', {
                bucketArn: Fn.importValue('PatikaServicesEnvBucketARN'),
                bucketName: Fn.importValue('PatikaServicesEnvBucketName'),
            });

            const executionRole = new aws_iam.Role(this, 'PatikaBackendFargeteServicesIAMRole', {
                roleName: 'PatikaBackendFargeteServicesIAMRole',
                assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amozonaws.com'),
            });


            const taskDef = new aws_ecs.FargateTaskDefinition(this, 'PatikaBackendFargeteServicesTaskDef', {
                family: 'PatikaBackendFargeteServicesTaskDef',
                cpu: 512,
                memoryLimitMiB: 1024,
                executionRole,
            });

            taskDef.addContainer('PatikaBackendServiceContainer', {
                containerName: 'patika-backend-service',
                image: aws_ecs.ContainerImage.fromEcrRepository(props.ecrStack),
                memoryReservationMiB: 512,
                portMappings: [
                    {
                        containerPort: 8080,
                        
                    }
                ],

                /*environment: {
                    DB_USER: 'bilge',
                    DB_PASSWORD: aws_ssm.StringParameter.fromStringParameterName(this, 'DB_PASSWORD', '/app/DB_PASSWORD').stringValue,
                },
                */

            });
            const serviceSg = new aws_ec2.SecurityGroup(this,'PatikaBackendECSFargeteSecurityGroup',{
                vpc,
                allowAllOutbound: true,
                securityGroupName: 'patika-backend-ecs-fargete-sg'

            });

            const service = new aws_ecs.FargateService(this, 'PatikaBackendFargeteService', {
                serviceName: 'Patika-Backend-Service',
                cluster,
                taskDefinition: taskDef,
                desiredCount: 1,
                
            });

            service.autoScaleTaskCount({
                maxCapacity: 5,
                minCapacity: 1,
            });

            const albSg = new aws_ec2.SecurityGroup(this,'AlbSg',{
                securityGroupName: 'patika-cloud-alb-sg',
                vpc,
                allowAllOutbound:true,
            });

            albSg.addEgressRule(aws_ec2.Peer.anyIpv4(),aws_ec2.Port.tcp(80),'allow access from anywhere to http port');
            albSg.addEgressRule(aws_ec2.Peer.anyIpv4(),aws_ec2.Port.tcp(443),'allow access from anywhere to https port');

            serviceSg.addEgressRule(albSg,aws_ec2.Port.tcpRange(49153,65535),'allow access container ports from ALB');

            const serviceAlb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'PatikaBackendALB', {
                loadBalancerName:'patika-cloud-alb',
                vpc,
                internetFacing: true,
                securityGroup: albSg,
                deletionProtection: true,  //eğer biri bunu silmek isterse önüne kural çıakrtır. 

            });

            const serviceTargetGroup = new aws_elasticloadbalancingv2.ApplicationTargetGroup(this,'ServiceTargetGroup',{
                healthCheck: {
                    enabled:true,
                    path: '/',
                    port: '8080',
                    protocol: aws_elasticloadbalancingv2.Protocol.HTTP,
                    healthyHttpCodes: '200',
                },

                port: 80,
                protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
                targetGroupName:'patika-backend-sg',
                targetType: aws_elasticloadbalancingv2.TargetType.IP,
                targets: [service],
                vpc,
            });

            serviceAlb.addListener('httpListener',{     // Arka planda pek çok task olabilir.Task Dağılımı için bunu yaptık.
                port: 80,
                protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
                defaultTargetGroups: [serviceTargetGroup]
            });

        }

    }
}
