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
      - "--insecure-registry=nexus.imcc.com:8085"
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
        NEXUS_HOST = "nexus.imcc.com:8085"
        NEXUS_REPO = "blockvote-2401098"
    }

    stages {

        stage("CHECK") {
            steps {
                echo "BlockVote Jenkins Pipeline Started for ${NAMESPACE}"
            }
        }

        /* ================= FRONTEND ================= */
        stage('Install + Build Frontend') {
            steps {
                dir('frontend') {
                    container('node') {
                        sh '''
                            echo "=== Frontend install & build ==="
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
        stage('Install Backend') {
            steps {
                dir('backend') {
                    container('node') {
                        sh '''
                            echo "=== Backend install ==="
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
                    sh """
                        echo "=== Building Docker images ==="
                        docker build -t blockvote-frontend:latest -f frontend/Dockerfile frontend/
                        docker build -t blockvote-backend:latest  -f backend/Dockerfile backend/
                    """
                }
            }
        }

        /* ================= NEXUS LOGIN ================= */
        stage("Login to Nexus") {
            steps {
                container("dind") {
                    sh """
                        docker login ${NEXUS_HOST} \
                          -u student \
                          -p Imcc@2025
                    """
                }
            }
        }

        /* ================= PUSH IMAGES ================= */
        stage("Push Images") {
            steps {
                container("dind") {
                    sh """
                        docker tag blockvote-frontend:latest ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-frontend:v1
                        docker tag blockvote-backend:latest  ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-backend:v1

                        docker push ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-frontend:v1
                        docker push ${NEXUS_HOST}/${NEXUS_REPO}/blockvote-backend:v1
                    """
                }
            }
        }

        /* ================= KUBERNETES DEPLOY ================= */
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        echo "=== Creating namespace if not exists ==="
                        kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

                        echo "=== Deploying Backend ==="
                        kubectl apply -n ${NAMESPACE} -f k8s/backend-deployment.yaml
                        kubectl apply -n ${NAMESPACE} -f k8s/backend-service.yaml

                        echo "=== Deploying Frontend ==="
                        kubectl apply -n ${NAMESPACE} -f k8s/frontend-deployment.yaml
                        kubectl apply -n ${NAMESPACE} -f k8s/frontend-service.yaml
                        kubectl apply -n ${NAMESPACE} -f k8s/ingress.yaml

                        echo "=== Pods Status ==="
                        kubectl get pods -n ${NAMESPACE}
                    '''
                }
            }
        }
    }
}
