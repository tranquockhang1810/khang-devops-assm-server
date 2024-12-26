pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'tranquockhang181004/khang-devops-assm-server'
        DOCKER_TAG = '1.0.0'
        PROD_SERVER = 'ec2-13-54-105-133.ap-southeast-2.compute.amazonaws.com'
        PROD_USER= 'ubuntu'
        TELEGRAM_BOT_TOKEN = "7626023144:AAHKCwYHpghRHInMs7XaOes6SssmecpIon0"
        TELEGRAM_CHAT_ID = "-1002433054280"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'master', url: 'https://github.com/tranquockhang1810/khang-devops-assm-server.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}", "--platform linux/amd64 -f server/Dockerfile ./server")
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                    }
                }
            }
        }

        stage('Deploy server to PROD') {
          steps {
            script {
              echo 'Deploying to PROD...'
              sshagent(['aws-ssh-key']) {
                sh '''
                  ssh -o StrictHostKeyChecking=no ${PROD_USER}@${PROD_SERVER} << EOF

                  # Clear old containers and images
                  docker container stop khang-devops-assm-server || echo "No container name khang-devops-assm-server to stop"
                  docker container rm khang-devops-assm-server || echo "No container name khang-devops-assm-server to remove"
                  docker image rm ${DOCKER_IMAGE}:${DOCKER_TAG} || echo "No image name ${DOCKER_IMAGE}:${DOCKER_TAG} to remove"
                  
                  docker container stop mongo-db || echo "No container name mongo-db to stop"

                  # Create 'prod' network if not exists
                  docker network create prod || echo "Network 'prod' already exists"

                  # Run MongoDB container
                  docker start mongo-db || echo "MongoDB container already running"

                  # Pull and run backend container
                  docker image pull ${DOCKER_IMAGE}:${DOCKER_TAG}
                  docker container run -d --rm --name khang-devops-assm-server -p 8000:8000 --network prod ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
              }
            }
          }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            sendTelegramMessage("✅ Build ASSM Server #${BUILD_NUMBER} was successful! ✅")
        }

        failure {
            sendTelegramMessage("❌ Build ASSM Server #${BUILD_NUMBER} failed. ❌")
        }
    }
}

def sendTelegramMessage(String message) {
    sh """
    curl -s -X POST https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage \
    -d chat_id=${TELEGRAM_CHAT_ID} \
    -d text="${message}"
    """
}