---
title: SSH into backend container
---

AWS Exec is new functionality that allows users to either run an interactive shell or a single command against a container
inside a task deployed on either Amazon EC2 or AWS Fargate.
You can find more information about AWS Exec [here](https://aws.amazon.com/blogs/containers/new-using-amazon-ecs-exec-access-your-containers-fargate-ec2/).

## Prerequisites

Using AWS Exec requires additional `SSM Session Manager` plugin for `AWS CLI`.
Installation guide is available [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html).

### Usage

AWS Exec does not create new, separate task like ssh bastion do, but connect with existing, running container.
Thats why we need specify `CLUSTER_NAME`, `TASK_ID` and `CONTAINER_NAME` in our commands.

Example command allowing run interactive shell inside selected container:
```shell
aws-vault exec <SELECTED_AWS_VAULT_PROFILE> -- aws ecs execute-command --cluster <CLUSTER_NAME> --region <REGION> --task <TASK_ID> --container <CONTAINER_NAME> --command "/bin/bash" --interactive
```
