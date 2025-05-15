#!/bin/sh

if [ ! -f /tmp/resources_created ]; then
    # Wait for LocalStack to be ready
    echo "Waiting for LocalStack to be ready..."
    while ! aws --endpoint-url=http://localstack:4566 s3 ls; do
        sleep 2
    done

    # Create S3 bucket
    echo "Creating S3 bucket..."
    aws --endpoint-url=http://localstack:4566 cloudformation create-stack --stack-name dev-static-bucket-stack --template-body file:///aws/cloudformation/s3-public-bucket.yml
    aws --endpoint-url=http://localstack:4566 cloudformation wait stack-create-complete --stack-name dev-static-bucket-stack
    echo "S3 public bucket created successfully."

    # Create Developer events SQS queues
    echo "Creating Developer events SQS queue..."
    aws --endpoint-url=http://localstack:4566 cloudformation create-stack --stack-name dev-developer-events-sqs-queues-stack --template-body file:///aws/cloudformation/developer-sqs-sns-events.yml
    aws --endpoint-url=http://localstack:4566 cloudformation wait stack-create-complete --stack-name dev-developer-events-sqs-queues-stack
    echo "SQS queues for developer events created successfully."

    # Create Report events SQS queues
    echo "Creating Report events SQS queue..."
    aws --endpoint-url=http://localstack:4566 cloudformation create-stack --stack-name dev-report-events-sqs-queues-stack --template-body file:///aws/cloudformation/report-sqs-sns-event.yml
    aws --endpoint-url=http://localstack:4566 cloudformation wait stack-create-complete --stack-name dev-report-events-sqs-queues-stack
    echo "SQS queues for report generation created successfully."
else
    echo 'Resources already created. Skipping initialization.';
fi