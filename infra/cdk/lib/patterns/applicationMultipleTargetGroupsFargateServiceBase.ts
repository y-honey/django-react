import {ICertificate} from "aws-cdk-lib/aws-certificatemanager";
import {IVpc} from "aws-cdk-lib/aws-ec2";
import {
  AwsLogDriver,
  BaseService,
  CloudMapOptions,
  ContainerDefinition,
  ContainerImage,
  ICluster,
  LogDriver,
  PropagatedTagSource,
  Protocol,
  Secret,
} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationProtocol,
  ApplicationTargetGroup,
  IApplicationListener,
  IApplicationLoadBalancer,
  ListenerCondition,
  Protocol as ELBProtocol,
  TargetType,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {ARecord, IHostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {Construct} from "constructs";
import {Duration} from "aws-cdk-lib";
import {LoadBalancerTarget} from "aws-cdk-lib/aws-route53-targets";

/**
 * The properties for the base ApplicationMultipleTargetGroupsEc2Service or ApplicationMultipleTargetGroupsFargateService service.
 */
export interface ApplicationMultipleTargetGroupsServiceBaseProps {
  /**
   * The name of the cluster that hosts the service.
   *
   * If a cluster is specified, the vpc construct should be omitted. Alternatively, you can omit both cluster and vpc.
   *
   * @default - create a new cluster; if both cluster and vpc are omitted, a new VPC will be created for you.
   */
  readonly cluster: ICluster;
  /**
   * The VPC where the container instances will be launched or the elastic network interfaces (ENIs) will be deployed.
   *
   * If a vpc is specified, the cluster construct should be omitted. Alternatively, you can omit both vpc and cluster.
   *
   * @default - uses the VPC defined in the cluster or creates a new VPC.
   */
  readonly vpc?: IVpc;
  /**
   * The properties required to create a new task definition. Only one of TaskDefinition or TaskImageOptions must be specified.
   *
   * @default none
   */
  readonly taskImageOptions?: ApplicationLoadBalancedTaskImageProps[];
  /**
   * The desired number of instantiations of the task definition to keep running on the service.
   *
   * @default 1
   */
  readonly desiredCount?: number;
  /**
   * The period of time, in seconds, that the Amazon ECS service scheduler ignores unhealthy
   * Elastic Load Balancing target health checks after a task has first started.
   *
   * @default - defaults to 60 seconds if at least one load balancer is in-use and it is not already set
   */
  readonly healthCheckGracePeriod?: Duration;
  /**
   * The name of the service.
   *
   * @default - CloudFormation-generated name.
   */
  readonly serviceName?: string;
  /**
   * The application load balancer that will serve traffic to the service.
   *
   * @default - a new load balancer with a listener will be created.
   */
  readonly loadBalancers: ApplicationLoadBalancerProps[];
  /**
   * Specifies whether to propagate the tags from the task definition or the service to the tasks in the service.
   * Tags can only be propagated to the tasks within the service during service creation.
   *
   * @default - none
   */
  readonly propagateTags?: PropagatedTagSource;
  /**
   * Specifies whether to enable Amazon ECS managed tags for the tasks within the service. For more information, see
   * [Tagging your Amazon ECS Resources](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-using-tags.html)
   *
   * @default false
   */
  readonly enableECSManagedTags?: boolean;
  /**
   * The options for configuring an Amazon ECS service to use service discovery.
   *
   * @default - AWS Cloud Map service discovery is not enabled.
   */
  readonly cloudMapOptions?: CloudMapOptions;
  /**
   * Properties to specify ALB target groups.
   *
   * @default - default portMapping registered as target group and attached to the first defined listener
   */
  readonly targetGroups?: ApplicationTargetProps[];
}

/**
 * Options for configuring a new container.
 */
export interface ApplicationLoadBalancedTaskImageProps {
  /**
   * The image used to start a container. Image or taskDefinition must be specified, not both.
   *
   * @default - none
   */
  readonly image: ContainerImage;
  /**
   * The environment variables to pass to the container.
   *
   * @default - No environment variables.
   */
  readonly environment?: {
    [key: string]: string;
  };
  /**
   * The secrets to expose to the container as an environment variable.
   *
   * @default - No secret environment variables.
   */
  readonly secrets?: {
    [key: string]: Secret;
  };
  /**
   * Flag to indicate whether to enable logging.
   *
   * @default true
   */
  readonly enableLogging?: boolean;
  /**
   * The log driver to use.
   *
   * @default - AwsLogDriver if enableLogging is true
   */
  readonly logDriver?: LogDriver;
  /**
   * The container name value to be specified in the task definition.
   *
   * @default - web
   */
  readonly containerName?: string;
  /**
   * A list of port numbers on the container that is bound to the user-specified or automatically assigned host port.
   *
   * If you are using containers in a task with the awsvpc or host network mode, exposed ports should be specified using containerPort.
   * If you are using containers in a task with the bridge network mode and you specify a container port and not a host port,
   * your container automatically receives a host port in the ephemeral port range.
   *
   * Port mappings that are automatically assigned in this way do not count toward the 100 reserved ports limit of a container instance.
   *
   * For more information, see
   * [hostPort](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_PortMapping.html#ECS-Type-PortMapping-hostPort).
   *
   * @default - [80]
   */
  readonly containerPorts?: number[];
}

/**
 * Properties to define an application target group.
 */
export interface ApplicationTargetProps {
  /**
   * The port number of the container. Only applicable when using application/network load balancers.
   */
  readonly containerPort: number;
  /**
   * The protocol used for the port mapping. Only applicable when using application load balancers.
   *
   * @default ecs.Protocol.TCP
   */
  readonly protocol?: Protocol;
  /**
   * Name of the listener the target group attached to.
   *
   * @default - default listener (first added listener)
   */
  readonly listener?: string;
  /**
   * Priority of this target group.
   *
   * The rule with the lowest priority will be used for every request.
   * If priority is not given, these target groups will be added as
   * defaults, and must not have conditions.
   *
   * Priorities must be unique.
   *
   * @default Target groups are used as defaults
   */
  readonly priority?: number;
  /**
   * Rule applies if the requested host matches the indicated host.
   *
   * May contain up to three '*' wildcards.
   *
   * Requires that priority is set.
   *
   * @see https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html#host-conditions
   *
   * @default No host condition
   */
  readonly hostHeader?: string;
  /**
   * Rule applies if the requested path matches the given path pattern.
   *
   * May contain up to three '*' wildcards.
   *
   * Requires that priority is set.
   *
   * @see https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html#path-conditions
   *
   * @default No path condition
   */
  readonly pathPattern?: string;
}

/**
 * Properties to define an application load balancer.
 */
export interface ApplicationLoadBalancerProps {
  /**
   * Listeners (at least one listener) attached to this load balancer.
   */
  readonly listeners: IApplicationListener[];
  readonly loadBalancer: IApplicationLoadBalancer;
  /**
   * Name of the load balancer.
   */
  readonly name?: string;
  /**
   * Determines whether the Load Balancer will be internet-facing.
   *
   * @default true
   */
  readonly publicLoadBalancer?: boolean;
  /**
   * The domain name for the service, e.g. "api.example.com."
   *
   * @default - No domain name.
   */
  readonly domainName?: string;
  /**
   * The Route53 hosted zone for the domain, e.g. "example.com."
   *
   * @default - No Route53 hosted domain zone.
   */
  readonly domainZone?: IHostedZone | null;
}

/**
 * Properties to define an application listener.
 */
export interface ApplicationListenerProps {
  /**
   * Name of the listener.
   */
  readonly name: string;
  /**
   * The protocol for connections from clients to the load balancer.
   * The load balancer port is determined from the protocol (port 80 for
   * HTTP, port 443 for HTTPS).  A domain name and zone must be also be
   * specified if using HTTPS.
   *
   * @default ApplicationProtocol.HTTP. If a certificate is specified, the protocol will be
   * set by default to ApplicationProtocol.HTTPS.
   */
  readonly protocol?: ApplicationProtocol;
  /**
   * The port on which the listener listens for requests.
   *
   * @default - Determined from protocol if known.
   */
  readonly port?: number;
  /**
   * Certificate Manager certificate to associate with the load balancer.
   * Setting this option will set the load balancer protocol to HTTPS.
   *
   * @default - No certificate associated with the load balancer, if using
   * the HTTP protocol. For HTTPS, a DNS-validated certificate will be
   * created for the load balancer's specified domain name.
   */
  readonly certificate?: ICertificate;
}

/**
 * The base class for ApplicationMultipleTargetGroupsEc2Service and ApplicationMultipleTargetGroupsFargateService classes.
 */
export abstract class ApplicationMultipleTargetGroupsServiceBase extends Construct {
  /**
   * The desired number of instantiations of the task definition to keep running on the service.
   */
  readonly desiredCount: number;
  /**
   * The default Application Load Balancer for the service (first added load balancer).
   */
  readonly loadBalancer: IApplicationLoadBalancer;
  /**
   * The default listener for the service (first added listener).
   */
  readonly listener: IApplicationListener;
  /**
   * The cluster that hosts the service.
   */
  readonly cluster: ICluster;
  protected logDriver?: LogDriver;
  protected listeners: IApplicationListener[];
  protected targetGroups: ApplicationTargetGroup[];
  private readonly loadBalancers: IApplicationLoadBalancer[];

  /**
   * Constructs a new instance of the ApplicationMultipleTargetGroupsServiceBase class.
   */
  protected constructor(
    scope: Construct,
    id: string,
    props: ApplicationMultipleTargetGroupsServiceBaseProps
  ) {
    super(scope, id);
    this.listeners = [];
    this.targetGroups = [];
    this.loadBalancers = [];
    this.validateInput(props);

    this.cluster = props.cluster;

    this.desiredCount = props.desiredCount || 1;
    if (props.taskImageOptions) {
      for (const taskImageOptionsProps of props.taskImageOptions) {
        this.logDriver = this.createLogDriver(
          taskImageOptionsProps.enableLogging,
          taskImageOptionsProps.logDriver
        );
      }
    }

    let lbId = 0;
    for (const lbProps of props.loadBalancers) {
      const internetFacing =
        lbProps.publicLoadBalancer !== undefined
          ? lbProps.publicLoadBalancer
          : true;
      const { loadBalancer: lb } = lbProps;

      this.loadBalancers.push(lb);

      for (const listener of lbProps.listeners) {
        this.listeners.push(listener);
      }
      this.createDomainName(
        lb,
        internetFacing,
        lbProps.domainName,
        lbProps.domainZone,
        `${lbId}`
      );
      lbId += 1;
    }
    // set up default load balancer and listener.
    this.loadBalancer = this.loadBalancers[0];
    this.listener = this.listeners[0];
  }

  protected createAWSLogDriver(prefix: string): AwsLogDriver {
    return new AwsLogDriver({ streamPrefix: prefix });
  }

  protected findListener(name?: string): IApplicationListener {
    if (!name) {
      return this.listener;
    }
    for (const listener of this.listeners) {
      if (listener.node.id === name) {
        return listener;
      }
    }
    throw new Error(
      `Listener ${name} is not defined. Did you define listener with name ${name}?`
    );
  }

  protected registerECSTargets(
    service: BaseService,
    container: ContainerDefinition,
    targets: ApplicationTargetProps[]
  ): ApplicationTargetGroup {
    interface GroupedTarget {
      target: {protocol?: Protocol, containerPort: number},
      hosts: ApplicationTargetProps[],
    }
    let groupedTargets: {[id: string]: GroupedTarget} = {};
    targets?.forEach((targetProps, index) => {
      const key = `${targetProps.protocol}, ${targetProps.containerPort}`;
      if(!(key in groupedTargets)) {
        groupedTargets[key] = {
          target: {
            protocol: targetProps.protocol,
            containerPort: targetProps.containerPort
          },
          hosts: []
        };
      }
      groupedTargets[key].hosts.push(targetProps);
    });
    Object.entries(groupedTargets).forEach(([key, groupedTarget], index) => {
      const targetGroup = new ApplicationTargetGroup(
        this,
        `TargetGroup${index}`,
        {
          vpc: service.cluster.vpc,
          port: groupedTarget.target.containerPort,
          healthCheck: {
            path: "/lbcheck",
            protocol: ELBProtocol.HTTP,
            interval: Duration.seconds(6),
            timeout: Duration.seconds(5),
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 2,
          },
          deregistrationDelay: Duration.seconds(10),
          targetType: TargetType.IP,
          targets: [
            service.loadBalancerTarget({
              containerName: container.containerName,
              containerPort: groupedTarget.target.containerPort,
              protocol: groupedTarget.target.protocol,
            }),
          ],
        }
      );

      groupedTarget.hosts.forEach((targetProps, nestedIndex) => {
        const conditions = []
        if (targetProps.hostHeader) {
          conditions.push(ListenerCondition.hostHeaders([targetProps.hostHeader]))
        }
        if (targetProps.pathPattern) {
            conditions.push(ListenerCondition.pathPatterns([targetProps.pathPattern]))
        }
        this.findListener(targetProps.listener).addTargetGroups(
          `ECSTargetGroup${index}${nestedIndex}${container.containerName}${targetProps.containerPort}`,
          {
            conditions: conditions,
            priority: targetProps.priority,
            targetGroups: [targetGroup],
          }
        );
      });

      this.targetGroups.push(targetGroup);
    });

    if (this.targetGroups.length === 0) {
      throw new Error("At least one target group should be specified.");
    }
    return this.targetGroups[0];
  }

  protected addPortMappingForTargets(
    container: ContainerDefinition,
    targets: ApplicationTargetProps[]
  ): void {
    for (const target of targets) {
      if (
        !container.findPortMapping(
          target.containerPort,
          target.protocol || Protocol.TCP
        )
      ) {
        container.addPortMappings({
          containerPort: target.containerPort,
          protocol: target.protocol,
        });
      }
    }
  }

  /**
   * Create log driver if logging is enabled.
   */
  private createLogDriver(
    enableLoggingProp?: boolean,
    logDriverProp?: LogDriver
  ) {
    const enableLogging =
      enableLoggingProp !== undefined ? enableLoggingProp : true;
    return logDriverProp !== undefined
      ? logDriverProp
      : enableLogging
      ? this.createAWSLogDriver(this.node.id)
      : undefined;
  }

  private validateInput(
    props: ApplicationMultipleTargetGroupsServiceBaseProps
  ) {
    if (props.cluster && props.vpc) {
      throw new Error(
        "You can only specify either vpc or cluster. Alternatively, you can leave both blank"
      );
    }
    if (props.desiredCount !== undefined && props.desiredCount < 1) {
      throw new Error("You must specify a desiredCount greater than 0");
    }
    if (props.loadBalancers) {
      if (props.loadBalancers.length === 0) {
        throw new Error("At least one load balancer must be specified");
      }
      for (const lbProps of props.loadBalancers) {
        if (lbProps.listeners.length === 0) {
          throw new Error("At least one listener must be specified");
        }
      }
    }
  }

  private createDomainName(
    loadBalancer: IApplicationLoadBalancer,
    internetFacing: boolean,
    name?: string,
    zone?: IHostedZone | null,
    id?: string
  ) {
    let domainName = loadBalancer.loadBalancerDnsName;
    if (typeof name !== "undefined") {
      if (typeof zone === "undefined") {
        throw new Error(
          "A Route53 hosted domain zone name is required to configure the specified domain name"
        );
      }
      if (internetFacing && zone) {
        const record = new ARecord(this, `DNS${loadBalancer.node.id}${id}`, {
          zone,
          recordName: name,
          target: RecordTarget.fromAlias(new LoadBalancerTarget(loadBalancer)),
        });
        domainName = record.domainName;
      }
    }
    return domainName;
  }
}
