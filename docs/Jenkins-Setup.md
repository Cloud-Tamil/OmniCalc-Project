# Jenkins Controller Setup & CI/CD Guide for OmniCalc

This guide provides end-to-end instructions for installing and running **Jenkins** via Docker, configuring global build tools, and setting up automated CI/CD builds for the **OmniCalc** application using both **Freestyle Projects** and **Declarative Pipelines**.

---

## 1. Directory Structure

All Jenkins configuration files are located in the `/Jenkins` folder:

```
Jenkins/
├── Dockerfile            # Customized Jenkins LTS image with Docker CLI & Node.js 22 LTS
├── plugins.txt           # Pre-installed Jenkins plugins manifest
├── docker-compose.yml    # Docker Compose file with persistent volumes & Docker socket
└── Jenkinsfile           # Declarative CI/CD pipeline definition for OmniCalc
```

---

## 2. Jenkins Installation & Startup

### Option A: Using Docker Compose (Recommended)

1. **Navigate to the `Jenkins` folder**:
   ```bash
   cd Jenkins
   ```

2. **Build and start the Jenkins controller in detached mode**:
   ```bash
   docker compose up -d --build
   ```

3. **Verify container status**:
   ```bash
   docker compose ps
   docker ps -a
   ```

4. **Retrieve the Initial Admin Unlock Password**:
   ```bash
   docker exec -it jenkins-controller cat /var/jenkins_home/secrets/initialAdminPassword
   ```

5. **Access the Jenkins Web UI**:
   Open your browser at `http://localhost:8080` (or your cloud server's port 8080).

---

### Option B: Using Standalone Docker CLI

If you do not have Docker Compose installed, run the following Docker commands:

1. **Navigate to the `Jenkins` folder**:
   ```bash
   cd Jenkins
   ```

2. **Create a persistent volume for Jenkins data**:
   ```bash
   docker volume create jenkins_home_data
   ```

3. **Build the customized Jenkins image (with Node.js 22 & Docker CLI)**:
   ```bash
   docker build -t custom-jenkins:node22 .
   ```

4. **Launch the Jenkins container**:
   ```bash
   docker run -d \
     --name jenkins-controller \
     --restart unless-stopped \
     -u root \
     -p 8080:8080 \
     -p 50000:50000 \
     -v jenkins_home_data:/var/jenkins_home \
     -v /var/run/docker.sock:/var/run/docker.sock \
     custom-jenkins:node22
   ```

5. **Fetch the unlock key from container logs**:
   ```bash
   docker logs jenkins-controller 2>&1 | grep -A 2 "Please use the following password"
   ```

---

## 3. Initial Jenkins Unlock & Admin Configuration

1. Open `http://localhost:8080` in your web browser.
2. **Unlock Jenkins**: Paste the password obtained from `initialAdminPassword`.
3. **Customize Jenkins**:
   - The Dockerfile automatically pre-installs essential plugins (`git`, `workflow-aggregator`, `nodejs`, `docker-workflow`, `blueocean`).
   - Click **Install suggested plugins** or continue to proceed.
4. **Create First Admin User**:
   - Set Username (e.g., `admin`).
   - Set Password, Full Name, and E-mail address.
5. **Instance Configuration**: Confirm the Jenkins URL as `http://localhost:8080/`.
6. Click **Save and Finish** -> **Start using Jenkins**.

---

## 4. Configuring Global Tools (Node.js & Git)

Before running builds, confirm Node.js tooling in Jenkins:

1. Go to **Manage Jenkins** -> **Tools** (Global Tool Configuration).
2. Under **NodeJS**:
   - In the customized container from `/Jenkins`, Node.js v22 and npm are already available system-wide in `/usr/bin/node` and `/usr/bin/npm`.
   - Optionally, click **Add NodeJS**, name it `NodeJS-22`, select version `NodeJS 22.x`, and check **Install automatically**.
3. Under **Git**: Ensure the path to the Git executable is `git` (detected automatically).
4. Click **Save**.

---

## 5. Setting Up a Freestyle Project Build

A **Freestyle project** is the easiest way to configure automated tasks with a graphical interface.

### Step-by-Step Freestyle Setup:

1. **Create the Project**:
   - From the Jenkins dashboard, click **New Item**.
   - Enter project name: `OmniCalc-freestyle`.
   - Select **Freestyle project** and click **OK**.

2. **General Settings**:
   - Check **Discard old builds** -> Max # of builds to keep: `10`.
   - Optional: Check **GitHub project** and enter your repository URL:
     `https://github.com/Cloud-Tamil/OmniCalc-Project.git`

3. **Source Code Management (SCM)**:
   - Select **Git**.
   - **Repository URL**: `https://github.com/Cloud-Tamil/OmniCalc-Project.git`.
   - **Credentials**: Click **Add** -> **Jenkins** if repository is private.
   - **Branch Specifier**: Set to `*/master` or `*/main`.

4. **Build Environment**:
   - Check **Delete workspace before build starts**.
   - If using the NodeJS plugin, check **Provide Node & npm bin/ folder to PATH** and select `NodeJS-22`.
   - Check **Add timestamps to the Console Output**.

5. **Build Steps**:
   - Click **Add build step** -> Select **Execute shell**.
   - Enter the following shell build script:

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "1. AUDITING BUILD RUNTIME ENVIRONMENT"
echo "=========================================="
node --version
npm --version
git --version

echo "=========================================="
echo "2. INSTALLING PROJECT DEPENDENCIES"
echo "=========================================="
npm install --legacy-peer-deps

echo "=========================================="
echo "3. RUNNING TYPESCRIPT LINT & TYPECHECK"
echo "=========================================="
npm run lint

echo "=========================================="
echo "4. BUILDING PRODUCTION VITE BUNDLE"
echo "=========================================="
npm run build

echo "=========================================="
echo "5. VERIFYING COMPILED ARTIFACTS"
echo "=========================================="
test -d dist
ls -lh dist/

echo "=========================================="
echo "6. PACKAGING DOCKER CONTAINER"
echo "=========================================="
if command -v docker &> /dev/null; then
  APP_IMAGE="omnicalc:${BUILD_NUMBER}"
  echo "Building Docker image: ${APP_IMAGE}..."
  # Auto-ensure legacy-peer-deps inside Dockerfile and clean esbuild
  sed -i 's/RUN npm install$/RUN npm install --legacy-peer-deps/g' Dockerfile 2>/dev/null || true
  sed -i '/"esbuild":/d' package.json 2>/dev/null || true
  docker build -t ${APP_IMAGE} -t omnicalc:latest .
fi

echo "=========================================="
echo "BUILD COMPLETED SUCCESSFULLY"
echo "=========================================="
```

6. **Post-build Actions**:
   - Click **Add post-build action** -> **Archive the artifacts**.
   - Files to archive: `dist/**, package.json`.

7. **Save & Execute**:
   - Click **Save**.
   - Click **Build Now** in the left sidebar.
   - Click the build number -> **Console Output** to monitor logs.

---

## 6. Setting Up a Pipeline Project (Jenkinsfile)

A **Pipeline project** uses code-defined stages (`Jenkins/Jenkinsfile`) for versioned CI/CD workflows.

### Step-by-Step Pipeline Setup:

1. From the Jenkins dashboard, click **New Item**.
2. Enter item name: `OmniCalc-pipeline`.
3. Select **Pipeline** and click **OK**.
4. Scroll down to the **Pipeline** configuration section:
   - **Definition**: Choose **Pipeline script from SCM**.
   - **SCM**: Select **Git**.
   - **Repository URL**: `https://github.com/Cloud-Tamil/OmniCalc-Project.git`.
   - **Branch Specifier**: `*/master` (or `*/main`).
   - **Script Path**: Enter `Jenkins/Jenkinsfile`.
5. Click **Save**.
6. Click **Build Now**.
7. In the left menu, click **Stage View** or open **Blue Ocean** to see stage-by-stage visual status:
   - `Checkout` → `Environment Audit` → `Install Dependencies` → `Lint & TypeCheck` → `Build Production Bundle` → `Verify Build Artifacts` → `Package Docker Image`.

---

## 7. Troubleshooting & Common Fixes

### Docker Socket Permission Issues
If your build fails with:
`Got permission denied while trying to connect to the Docker daemon socket`

Run this command on your host machine to allow container access:
```bash
sudo chmod 666 /var/run/docker.sock
```
Or ensure the `jenkins` user is added to the docker group:
```bash
docker exec -u root -it jenkins-controller usermod -aG docker jenkins
```

### Dependency Resolution (ERESOLVE)
Always ensure build scripts use `npm install --legacy-peer-deps` so that strict npm 10+ environments never stall on optional peer conflicts.
