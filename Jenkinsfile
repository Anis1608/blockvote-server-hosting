pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:

  - name: node
    image: mirror.gcr.io/library/node:20
    command: ["cat"]
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command:
      - /bin/sh
      - -c
      - sleep infinity
    tty: true
    securityContext:
      runAsUser: 0
      readOnlyRootFilesystem: false
    env:
      - name: KUBECONFIG
        value: /kube/config
    volumeMounts:
      - name: kubeconfig-secret
        mountPath: /kube/config
        subPath: kubeconfig

  - name: dind
    image: docker:dind
    args:
      - "--storage-driver=overlay2"
      - "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
    securityContext:
      privileged: true
    env:
      - name: DOCKER_TLS_CERTDIR
        value: ""

  volumes:
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        NAMESPACE  = "2401098"
        NEXUS_HOST = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        NEXUS_REPO = "blockvote-2401098"
        IMAGE_TAG  = "v1"
    }

    stages {

        stage("CHECK") {
            steps {
                echo "BlockVote Jenkins Pipeline Started for ${NAMESPACE}"
            }
        }

        /* ================= FRONTEND ================= */
        stage("Install + Build Frontend") {
            steps {
                dir('frontend') {
                    container('node') {
                        sh '''
                            echo "=== FRONTEND INSTALL & BUILD ==="
                            npm cache clean --force || true
                            rm -rf node_modules package-lock.json || true
                            npm install --legacy-peer-deps
                            CI=false npm run build
                        '''
                    }
                }
            }
        }

        /* ================= BACKEND ================= */
        stage("Install Backend") {
            steps {
                dir('backend') {
                    container('node') {
                        sh '''
                            echo "=== BACKEND INSTALL ==="
                            npm cache clean --force || true
                            rm -rf node_modules package-lock.json || true
                            npm install --legacy-peer-deps
                        '''
                    }
                }
            }
        }

        /* ================= DOCKER BUILD ================= */
        stage("Build Docker Images") {
            steps {
                container("dind") {
                    sh '''
                        echo "=== BUILDING DOCKER IMAGES ==="
                        docker build -t blockvote-frontend:latest -f frontend/Dockerfile frontend/
                        docker build -t blockvote-backend:latest  -f backend/Dockerfile backend/
                    '''
                }
            }
        }

        /* ================= NEXUS LOGIN ================= */
        stage("Login to Nexus") {
            steps {
                container("dind") {
                    sh '''
                        echo "=== LOGIN TO NEXUS (HTTP INSECURE REGISTRY) ==="
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                          -u student \
                          -p Imcc@2025
                    '''
                }
            }
        }

        /* ================= PUSH IMAGES ================= */
        stage("Push Images to Nexus") {
            steps {
                container("dind") {
                    sh '''
                        echo "=== TAG & PUSH IMAGES ==="

                        docker tag blockvote-frontend:latest \
                          ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-frontend:${IMAGE_TAG}

                        docker tag blockvote-backend:latest \
                          ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-backend:${IMAGE_TAG}

                        docker push ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-frontend:${IMAGE_TAG}
                        docker push ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-backend:${IMAGE_TAG}
                    '''
                }
            }
        }

        /* ================= KUBERNETES DEPLOY ================= */
        stage("Deploy to Kubernetes") {
            steps {
                container('kubectl') {
                    sh '''
                        echo "=== CREATE NAMESPACE (IF NOT EXISTS) ==="
                        kubectl create namespace ${NAMESPACE} \
                          --dry-run=client -o yaml | kubectl apply -f -

                        echo "=== APPLY BACKEND ==="
                        kubectl apply -n ${NAMESPACE} -f k8s/backend-deployment.yaml
                        kubectl apply -n ${NAMESPACE} -f k8s/backend-service.yaml

                        echo "=== APPLY FRONTEND ==="
                        kubectl apply -n ${NAMESPACE} -f k8s/frontend-deployment.yaml
                        kubectl apply -n ${NAMESPACE} -f k8s/frontend-service.yaml
                        kubectl apply -n ${NAMESPACE} -f k8s/ingress.yaml

                        echo "=== POD STATUS ==="
                        kubectl get pods -n ${NAMESPACE}
                    '''
                }
            }
        }

        stage("DEBUG POD ISSUE") {
    steps {
        container('kubectl') {
            sh '''
                echo "=== POD LIST ==="
                kubectl get pods -n 2401098

                echo "=== BACKEND POD DESCRIBE ==="
                kubectl describe pod -n 2401098 -l app=blockvote-backend

                echo "=== FRONTEND POD DESCRIBE ==="
                kubectl describe pod -n 2401098 -l app=blockvote-frontend

                echo "=== EVENTS ==="
                kubectl get events -n 2401098 --sort-by=.metadata.creationTimestamp
            '''
        }
    }
}

    }
}
