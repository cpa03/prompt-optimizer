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
- Uses TLS for external access (via Ingress)

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
3. **Add network policies**: Restrict inter-namespace communication
4. **Configure resource quotas**: Set namespace-level resource limits
5. **Enable monitoring**: Add Prometheus annotations for metrics collection
