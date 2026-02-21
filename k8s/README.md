# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying Prompt Optimizer to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured to access your cluster
- NGINX Ingress Controller (optional, for external access)
- cert-manager (optional, for TLS certificates)

## Quick Start

### 1. Create the namespace and base resources

```bash
kubectl apply -f k8s/deployment.yaml
```

### 2. Create API keys secret (optional)

Create a secret with your API keys:

```bash
kubectl create secret generic prompt-optimizer-api-keys \
  --from-literal=openai-api-key=your-openai-key \
  --from-literal=gemini-api-key=your-gemini-key \
  --from-literal=deepseek-api-key=your-deepseek-key \
  -n prompt-optimizer
```

### 3. Update the Ingress host

Edit the Ingress resource to use your domain:

```bash
kubectl edit ingress prompt-optimizer -n prompt-optimizer
```

Change `prompt-optimizer.example.com` to your actual domain.

## Configuration

### ConfigMap

The `prompt-optimizer-config` ConfigMap contains non-sensitive configuration:

| Key                          | Default | Description          |
| ---------------------------- | ------- | -------------------- |
| `NGINX_PORT`                 | 80      | Internal nginx port  |
| `MCP_LOG_LEVEL`              | info    | MCP server log level |
| `MCP_DEFAULT_LANGUAGE`       | zh      | Default language     |
| `MCP_DEFAULT_MODEL_PROVIDER` | openai  | Default LLM provider |

### Secrets

Two secrets are used:

1. **prompt-optimizer-secrets**: Basic auth credentials
   - `ACCESS_USERNAME`: Username for web access
   - `ACCESS_PASSWORD`: Password for web access

2. **prompt-optimizer-api-keys**: API keys for LLM providers (create manually)
   - `openai-api-key`: OpenAI API key
   - `gemini-api-key`: Gemini API key
   - `deepseek-api-key`: DeepSeek API key

## Resource Requirements

| Resource | Request | Limit |
| -------- | ------- | ----- |
| CPU      | 250m    | 2     |
| Memory   | 256Mi   | 1Gi   |

## Scaling

To scale the deployment:

```bash
kubectl scale deployment prompt-optimizer --replicas=3 -n prompt-optimizer
```

Note: For horizontal pod autoscaling, consider using HPA with custom metrics.

## Health Checks

The deployment includes:

- **Liveness probe**: Checks `/` every 30s after 40s initial delay
- **Readiness probe**: Checks `/` every 10s after 10s initial delay

## Security

The deployment follows security best practices:

- Runs with minimal capabilities (`cap_drop: ALL`)
- Prevents privilege escalation (`allowPrivilegeEscalation: false`)
- Runs as non-root user (`runAsNonRoot: true`, `runAsUser: 101`)
- Read-only root filesystem with ephemeral volumes for writable paths
- Seccomp profile enabled (`RuntimeDefault`)
- Uses dedicated ServiceAccount with `automountServiceAccountToken: false`
- Pod Security Standards enforced at namespace level (`restricted` profile)
- Network policies restrict traffic flow
- Uses TLS for external access (via Ingress)

### ServiceAccount

The deployment uses a dedicated ServiceAccount `prompt-optimizer` with:

- `automountServiceAccountToken: false` - No automatic token mounting for security

### Resource Governance

The namespace has ResourceQuota and LimitRange configured:

**ResourceQuota (prompt-optimizer-quota):**

- Max 10 pods
- Max 4 CPU / 8 CPU (requests/limits)
- Max 4Gi / 8Gi memory (requests/limits)
- Max 5 persistent volume claims
- Max 10 secrets, 10 configmaps, 5 services

**LimitRange (prompt-optimizer-limits):**

- Container defaults: 500m CPU, 512Mi memory
- Container requests: 100m CPU, 128Mi memory
- Container max: 2 CPU, 1Gi memory
- PVC: 1Gi - 10Gi storage range

## Troubleshooting

### Check pod status

```bash
kubectl get pods -n prompt-optimizer
kubectl describe pod <pod-name> -n prompt-optimizer
```

### View logs

```bash
kubectl logs -f deployment/prompt-optimizer -n prompt-optimizer
```

### Check events

```bash
kubectl get events -n prompt-optimizer --sort-by='.lastTimestamp'
```

## Production Considerations

1. **Change default password**: Update `ACCESS_PASSWORD` in the secret
2. **Use proper TLS**: Configure cert-manager for automatic certificate management
3. **Review network policies**: Adjust NetworkPolicy to match your infrastructure
4. **Configure resource quotas**: The namespace has ResourceQuota set; adjust limits as needed
5. **Enable monitoring**: Prometheus annotations and ServiceMonitor are included for metrics collection
6. **Review Pod Security**: The namespace enforces `restricted` Pod Security Standards
7. **Audit ServiceAccount**: Review and minimize permissions if custom RBAC is needed

## Auto-Scaling (HPA)

The deployment includes a HorizontalPodAutoscaler (HPA) that automatically scales the application based on:

| Metric | Target Utilization | Min Replicas | Max Replicas |
| ------ | ------------------ | ------------ | ------------ |
| CPU    | 70%                | 1            | 5            |
| Memory | 80%                | 1            | 5            |

### HPA Behavior

- **Scale Up**: Adds up to 100% or 2 pods every 15 seconds after 60s stabilization
- **Scale Down**: Removes up to 10% every 60 seconds after 300s stabilization

To check HPA status:

```bash
kubectl get hpa -n prompt-optimizer
kubectl describe hpa prompt-optimizer-hpa -n prompt-optimizer
```

## High Availability (PDB)

A PodDisruptionBudget (PDB) ensures at least 1 pod is always available during:

- Node maintenance
- Cluster upgrades
- Voluntary disruptions

To check PDB status:

```bash
kubectl get pdb -n prompt-optimizer
kubectl describe pdb prompt-optimizer-pdb -n prompt-optimizer
```

## Network Security

A NetworkPolicy restricts traffic:

- **Ingress**: Only allows traffic from the ingress-nginx namespace
- **Egress**: Allows DNS queries and external API calls only

To modify for your environment, edit the NetworkPolicy:

```bash
kubectl edit networkpolicy prompt-optimizer-netpol -n prompt-optimizer
```

## Monitoring (Prometheus)

The deployment includes built-in monitoring support for Prometheus:

### Pod Annotations

Pod annotations for Prometheus auto-discovery:

```yaml
prometheus.io/scrape: 'true'
prometheus.io/port: '80'
prometheus.io/path: '/metrics'
```

### ServiceMonitor (Prometheus Operator)

A ServiceMonitor is included for clusters using Prometheus Operator:

```bash
kubectl apply -f k8s/deployment.yaml
```

The ServiceMonitor is configured with:

- **Scrape interval**: 30s
- **Scrape timeout**: 10s
- **Metrics path**: /metrics

To verify ServiceMonitor is working:

```bash
kubectl get servicemonitor -n prompt-optimizer
kubectl describe servicemonitor prompt-optimizer -n prompt-optimizer
```

**Note**: The `release: prometheus` label on the ServiceMonitor should match your Prometheus Operator's serviceMonitorSelector. Adjust if needed.
