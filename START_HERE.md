# 👋 Welcome to Sada!

## 🚀 Get Started in 3 Steps

### Step 1: Choose Your Method

| Method | Command | Time |
|--------|---------|------|
| **🚀 Quickest** | `./quick-setup.sh` | 1 min |
| **🔧 Complete** | `./docker-setup.sh` | 5 min |
| **💻 Local Dev** | `yarn install && yarn dev` | 5 min |

### Step 2: Run the Command

```bash
# Recommended for first-time users
./quick-setup.sh
```

### Step 3: Open Your Browser

Go to: **http://localhost:3000**

Login:
- Username: `berdoz`
- Password: `berdoz@code`

---

## 📚 What Next?

### New to Docker?
→ Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### Want Full Control?
→ Read [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

### Need Commands?
→ Bookmark [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)

### See All Files?
→ Check [DOCKER_INDEX.md](./DOCKER_INDEX.md)

---

## 🛠️ Daily Use

```bash
# Check status
./status.sh

# Manage application
./docker-start.sh

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## 🆘 Having Issues?

1. Check logs: `docker-compose logs app`
2. Run health check: `./docker-health-check.sh`
3. Read troubleshooting: [SETUP_GUIDE.md](./SETUP_GUIDE.md#-troubleshooting)

---

## ⚠️ Important

**Change the default password immediately after first login!**

Default credentials are:
- Username: `berdoz`
- Password: `berdoz@code`

---

**Ready? Run this:**

```bash
./quick-setup.sh
```

🎉 That's it! You're all set!
