import { RemovalPolicy,Stack, StackProps,CfnOutput, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
    aws_s3,
    aws_cloudfront,
    aws_cloudfront_origins
} from 'aws-cdk-lib';

export class PatikaCloudStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
     
    const patikaBucket =  aws_s3.Bucket.fromBucketArn(this,'dddd',Fn.importValue('PatikaBucketARN'));

    const cfOrigin = new aws_cloudfront_origins.S3Origin(patikaBucket)

  }
}
