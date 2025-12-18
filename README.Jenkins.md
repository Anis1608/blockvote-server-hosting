# Jenkins CI/CD Setup Guide for BlockVote

This guide explains how to set up Jenkins for continuous integration and deployment of the BlockVote project.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Jenkins Configuration](#jenkins-configuration)
- [Pipeline Overview](#pipeline-overview)
- [Environment Setup](#environment-setup)
- [Running the Pipeline](#running-the-pipeline)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Jenkins Plugins

Install these plugins in Jenkins:

1. **Pipeline** - For Jenkinsfile support
2. **Git** - For source code management
3. **Docker Pipeline** - For Docker build/push
4. **NodeJS** - For Node.js builds
5. **SonarQube Scanner** - For code quality analysis
6. **Credentials Binding** - For secure credential management
7. **Email Extension** - For notifications (optional)
8. **Slack Notification** - For Slack alerts (optional)

### Install Plugins via Jenkins UI

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Click **Available** tab
3. Search and install the plugins listed above
4. Restart Jenkins

---

## Jenkins Configuration

### 1. Configure Node.js

**Manage Jenkins** → **Global Tool Configuration** → **NodeJS**

- Click **Add NodeJS**
- Name: `20` (or `Node 20`)
- Version: Select Node.js 20.x
- Save

### 2. Configure Docker

Ensure Docker is installed on the Jenkins server:

```bash
# On Jenkins server
docker --version
docker-compose --version
```

Add Jenkins user to docker group:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 3. Configure SonarQube

**Manage Jenkins** → **Configure System** → **SonarQube servers**

- Name: `SonarQube`
- Server URL: `http://sonarqube.imcc.com/`
- Server authentication token: Add credential (see below)

### 4. Add Credentials

**Manage Jenkins** → **Manage Credentials** → **Global** → **Add Credentials**

#### SonarQube Token

- Kind: `Secret text`
- Secret: `sqp_51dc6dfb789de440cbc3320e8591365708d7018b`
- ID: `sonarqube-token`
- Description: `SonarQube Authentication Token`

#### Docker Hub Credentials (if pushing to Docker Hub)

- Kind: `Username with password`
- Username: Your Docker Hub username
- Password: Your Docker Hub password/token
- ID: `dockerhub-credentials`
- Description: `Docker Hub Credentials`

#### GitHub/GitLab Credentials (if private repo)

- Kind: `Username with password` or `SSH Username with private key`
- Configure based on your Git provider
- ID: `git-credentials`

---

## Pipeline Overview

The Jenkinsfile includes the following stages:

### 1. **Checkout** 📥
- Clones the repository
- Gets the Git commit ID for tagging

### 2. **Install Dependencies** 📦
- Installs Backend dependencies (`npm ci`)
- Installs Frontend dependencies (`npm ci`)
- Installs root dependencies for SonarQube

### 3. **Lint & Code Quality** 🔍
- Runs ESLint on Backend
- Runs ESLint on Frontend

### 4. **Build** 🏗️
- Builds Frontend production bundle
- Verifies Backend setup

### 5. **SonarQube Analysis** 📊
- Runs code quality analysis
- Sends results to SonarQube server

### 6. **Security Scan** 🔒
- Runs `npm audit` on Backend
- Runs `npm audit` on Frontend

### 7. **Build Docker Images** 🐳
- Builds Backend Docker image
- Builds Frontend Docker image
- Tags with commit ID and `latest`

### 8. **Push Docker Images** 📤
- Pushes images to Docker registry
- Only runs on `main` branch

### 9. **Deploy** 🚀
- Deploys using docker-compose
- Only runs on `main` branch

### 10. **Health Check** 🏥
- Verifies Backend API is running
- Verifies Frontend is accessible

---

## Environment Setup

### Create Jenkins Pipeline Job

1. **New Item** → Enter name: `BlockVote-Pipeline`
2. Select **Pipeline**
3. Click **OK**

### Configure Pipeline

#### General Settings

- ✅ **GitHub project** (if using GitHub)
  - Project URL: `https://github.com/Anis1608/BlockVote`

#### Build Triggers

- ✅ **GitHub hook trigger for GITScm polling** (for auto-builds on push)
- ✅ **Poll SCM**: `H/5 * * * *` (check every 5 minutes)

#### Pipeline Configuration

- **Definition**: Pipeline script from SCM
- **SCM**: Git
  - Repository URL: `https://github.com/Anis1608/BlockVote.git`
  - Credentials: Select your Git credentials
  - Branch: `*/main`
- **Script Path**: `Jenkinsfile`

### Environment Variables

Add these in **Pipeline** → **Environment Variables** (if needed):

```groovy
DOCKER_REGISTRY=docker.io
PROJECT_NAME=blockvote
NODE_VERSION=20
```

---

## Running the Pipeline

### Manual Build

1. Go to your Jenkins job
2. Click **Build Now**
3. Monitor the build in **Console Output**

### Automatic Builds

#### GitHub Webhook Setup

1. Go to your GitHub repository
2. **Settings** → **Webhooks** → **Add webhook**
3. Payload URL: `http://your-jenkins-server/github-webhook/`
4. Content type: `application/json`
5. Events: **Just the push event**
6. Save

Now every push to the repository will trigger a build!

---

## Pipeline Customization

### Modify Jenkinsfile

You can customize the `Jenkinsfile` for your needs:

#### Skip Stages

Comment out stages you don't need:

```groovy
// stage('Security Scan') {
//     steps {
//         echo 'Skipping security scan'
//     }
// }
```

#### Change Branch for Deployment

```groovy
when {
    branch 'production'  // Deploy only on production branch
}
```

#### Add Notifications

Uncomment the email/Slack sections in the `post` block:

```groovy
post {
    success {
        emailext subject: "✅ Build #${BUILD_NUMBER} - SUCCESS",
                 body: "Build completed successfully!",
                 to: "team@example.com"
    }
}
```

---

## Docker Deployment Options

### Option 1: Docker Compose (Default)

The pipeline uses `docker-compose` by default:

```groovy
sh 'docker-compose down || true'
sh 'docker-compose up -d'
```

### Option 2: Kubernetes

Uncomment the Kubernetes section in the Deploy stage:

```groovy
sh 'kubectl apply -f k8s/'
sh 'kubectl rollout status deployment/blockvote-backend'
```

### Option 3: Docker Swarm

Replace the deploy section with:

```groovy
sh 'docker stack deploy -c docker-compose.yml blockvote'
```

---

## Monitoring & Logs

### View Build Logs

- Click on build number → **Console Output**

### View SonarQube Results

- Go to `http://sonarqube.imcc.com/`
- Find project: `blockvote-2401098`

### View Docker Logs

```bash
# On Jenkins server
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Troubleshooting

### Build Fails at "Install Dependencies"

**Issue**: `npm ci` fails

**Solution**:
```bash
# Delete package-lock.json and try again
rm Backend/package-lock.json Frontend/package-lock.json
npm install
```

### Docker Build Fails

**Issue**: Permission denied

**Solution**:
```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### SonarQube Analysis Fails

**Issue**: Cannot connect to SonarQube

**Solution**:
1. Verify SonarQube server is running
2. Check token is correct in Jenkins credentials
3. Verify network connectivity from Jenkins to SonarQube

### Health Check Fails

**Issue**: `curl: (7) Failed to connect`

**Solution**:
1. Check if containers are running: `docker ps`
2. Check container logs: `docker-compose logs backend`
3. Verify ports are not blocked by firewall

### Pipeline Stuck

**Issue**: Pipeline hangs at a stage

**Solution**:
1. Click **Abort** to stop the build
2. Check Jenkins executor availability
3. Restart Jenkins if needed: `sudo systemctl restart jenkins`

---

## Best Practices

### 1. Branch Strategy

- **main**: Production-ready code, triggers deployment
- **develop**: Development branch, runs tests only
- **feature/***: Feature branches, runs tests only

### 2. Secrets Management

- Never commit credentials to Git
- Use Jenkins credentials for all secrets
- Rotate tokens regularly

### 3. Build Optimization

- Use `npm ci` instead of `npm install` (faster, more reliable)
- Cache node_modules between builds
- Run tests in parallel

### 4. Notifications

- Set up email/Slack notifications for build failures
- Notify team on successful deployments

---

## Advanced Configuration

### Multi-Branch Pipeline

For better branch management:

1. Create **Multibranch Pipeline** instead of regular Pipeline
2. Jenkins will automatically discover branches
3. Each branch gets its own build

### Parallel Execution

Already implemented in the Jenkinsfile:

```groovy
parallel {
    stage('Backend') { ... }
    stage('Frontend') { ... }
}
```

### Build Parameters

Add parameters to your pipeline:

```groovy
parameters {
    choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'])
    booleanParam(name: 'SKIP_TESTS', defaultValue: false)
}
```

---

## Useful Commands

### Jenkins CLI

```bash
# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Check Jenkins status
sudo systemctl status jenkins
```

### Docker Commands

```bash
# View running containers
docker ps

# View all images
docker images

# Clean up unused images
docker image prune -a

# View logs
docker-compose logs -f
```

---

## Support

For issues with Jenkins setup:

1. Check Jenkins logs: `/var/log/jenkins/jenkins.log`
2. Review build console output
3. Check SonarQube dashboard
4. Verify Docker is running

---

## Summary

Your Jenkins pipeline will:

✅ Automatically build on every push  
✅ Run code quality checks with SonarQube  
✅ Scan for security vulnerabilities  
✅ Build Docker images  
✅ Deploy to production (on main branch)  
✅ Perform health checks  
✅ Send notifications on success/failure  

**Happy Building! 🚀**
