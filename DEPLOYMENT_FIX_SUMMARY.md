# BlockVote Deployment - Issue Resolution Summary

## 🔴 Original Problem
Your pods were stuck in `ImagePullBackOff` status for 18-20 hours, unable to pull Docker images from the Nexus registry.

---

## ✅ Root Causes Identified & Fixed

### 1. **Secret Created After Deployment** (CRITICAL ❌)
**Problem**: Jenkinsfile was deploying pods BEFORE creating the `nexus-secret`
- Pods tried to pull images without authentication
- Result: `ImagePullBackOff`

**Fix**: Reordered pipeline stages
```
OLD ORDER: Deploy → Create Secret ❌
NEW ORDER: Create Secret → Deploy ✅
```

### 2. **Ingress Configuration Missing Required Fields** 
**Problem**: Ingress didn't follow college template
- Missing `ingressClassName: nginx`
- Missing required annotations
- Wrong domain (`.college.local` instead of `.imcc.com`)
- No namespace specified

**Fix**: Updated ingress.yaml to match college standards
```yaml
ingressClassName: nginx
annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /
host: blockvote.imcc.com
namespace: "2401098"
```

### 3. **Old Pods Not Recreated**
**Problem**: Even after creating the secret, OLD pods from before the secret existed were still running
- They don't automatically pick up new secrets
- Need to be deleted and recreated

**Fix**: Added pod deletion step in pipeline
```bash
kubectl delete pods --all -n ${NAMESPACE}
```

---

## 📋 Changes Made to Your Files

### ✅ `Jenkinsfile`
1. **Moved "Create Nexus Pull Secret" stage BEFORE "Deploy to Kubernetes"**
2. **Added pod deletion** to force recreation with new secret
3. **Added verification steps**:
   - Verify secret exists
   - Verify images pushed successfully
   - Wait for pods to start
   - Show detailed events for troubleshooting
4. **Added "Verify Deployment" stage** to check final status

### ✅ `k8s/ingress.yaml`
1. Added `namespace: "2401098"`
2. Added `ingressClassName: nginx`
3. Added `nginx.ingress.kubernetes.io/rewrite-target: /` annotation
4. Changed host from `blockvote.college.local` to `blockvote.imcc.com`

### ✅ `k8s/backend-deployment.yaml` & `k8s/frontend-deployment.yaml`
- ✅ Already configured correctly with `imagePullSecrets: nexus-secret`

---

## 🚀 What Happens Now (Pipeline Flow)

```
1. Check → Checkout code
2. Install → Frontend & Backend dependencies
3. Build → Docker images
4. Login → Nexus registry
5. Push → Images to nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085
   └─ Verify images were pushed ✅
6. CREATE SECRET → nexus-secret with credentials ⭐ (MOVED HERE)
   └─ Verify secret exists ✅
7. DELETE OLD PODS → Force restart with new secret ⭐ (NEW)
8. Deploy → Apply k8s manifests
   └─ Wait 10 seconds
   └─ Show pod status
   └─ Describe failing pods (if any)
9. Verify → Wait for pods to be ready (120s timeout)
   └─ Show final status
   └─ Show ingress details
```

---

## 🌐 Application Access

After successful deployment, your application will be available at:

```
http://blockvote.imcc.com
```

### How to Verify:
```bash
# Check pod status
kubectl get pods -n 2401098

# Expected output (READY should be 1/1):
NAME                                  READY   STATUS    RESTARTS   AGE
blockvote-backend-xxxxx               1/1     Running   0          2m
blockvote-frontend-xxxxx              1/1     Running   0          2m

# Check ingress
kubectl get ingress -n 2401098

# Expected output:
NAME                 HOSTS                 ADDRESS         PORTS
blockvote-ingress    blockvote.imcc.com    <IP-ADDRESS>    80
```

---

## 🔍 Troubleshooting Guide

### If pods still show ImagePullBackOff:

1. **Check if secret exists**:
   ```bash
   kubectl get secret nexus-secret -n 2401098
   ```

2. **Check if images were pushed**:
   - Look at Jenkins "Push Images to Nexus" stage output
   - Should show: `nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/blockvote-2401098/blockvote-backend:v1`

3. **Describe the failing pod**:
   ```bash
   kubectl describe pod <pod-name> -n 2401098
   ```
   Look for the "Events" section for exact error

### If images can't be pulled from inside cluster:

The registry URL uses internal cluster DNS:
- `nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085`

If this doesn't resolve from the node, you may need to:
- Ask your college IT to ensure the nexus service is accessible cluster-wide
- Or use NodePort/LoadBalancer service for Nexus instead of ClusterIP

---

## 📊 Pipeline Stages Summary

| Stage | Purpose | Status |
|-------|---------|--------|
| Install + Build Frontend | npm install & build | ✅ Working |
| Install Backend | npm install | ✅ Working |
| Build Docker Images | Create backend/frontend images | ✅ Working |
| Login to Nexus | Authenticate to registry | ✅ Working |
| Push Images | Upload to registry | ✅ Enhanced with verification |
| Create Secret | **Generate nexus-secret** | ⭐ **MOVED BEFORE DEPLOY** |
| Deploy | Apply K8s manifests | ⭐ **Enhanced with pod deletion** |
| Verify | Check deployment health | ⭐ **NEW STAGE** |

---

## 🎯 Key Takeaways

1. **Always create secrets BEFORE deploying pods that need them**
2. **Old pods don't automatically pick up new secrets - delete them**
3. **Use college-provided templates for ingress configuration**
4. **Internal cluster DNS (*.svc.cluster.local) is only accessible from within the cluster**
5. **imagePullSecrets must reference an existing secret in the same namespace**

---

## ✅ Next Steps

1. **Trigger Jenkins build** (manual or auto on push)
2. **Monitor the pipeline** - watch for:
   - ✅ "VERIFY IMAGES PUSHED" shows blockvote images
   - ✅ "CREATE NEXUS PULL SECRET" completes successfully
   - ✅ "DELETE OLD PODS" removes old failing pods
   - ✅ "FINAL POD STATUS" shows READY 1/1
3. **Access the app** at `http://blockvote.imcc.com`
4. **Celebrate!** 🎉

---

## 📞 Support

If issues persist, check:
- Jenkins console output for exact errors
- Pod events: `kubectl describe pod <name> -n 2401098`
- Registry accessibility from nodes
- Network policies blocking access to Nexus

Good luck! 🚀
