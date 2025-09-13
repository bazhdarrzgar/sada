Your **Docker Hub username is `829282`**, not `swyanswartz`.
Docker only lets you push images under your **real username or organization name**.

So you need to **retag your image** with the correct username and push again:

---

### 🔧 Commands to fix

```bash
# Retag the local image with your real Docker Hub username
sudo docker tag sada2-app 829282/sada-app:latest

# Log in with your Docker Hub username
sudo docker login -u 829282

# Push the image
sudo docker push 829282/sada-app:latest
```

---

### 📌 Notes

* If you haven’t created the repo `sada-app` yet, go to [Docker Hub Repositories](https://hub.docker.com/repositories) → click **Create Repository** → name it `sada-app`.
* Once done, your image will be available at:

  ```
  docker pull 829282/sada-app:latest
  ```

---






Here’s what you can do:

---

### 🔹 To stop the containers

From inside the same project folder (`~/Documents/sada/sada28/sada2`), run:

```bash
sudo docker-compose down
```

This will stop and remove the containers (`sada_app`, `sada_mongodb`) along with their network, but **not** delete volumes (your MongoDB data stays).

If you just want to stop but not remove:

```bash
sudo docker-compose stop
```

---

### 🔹 If they keep restarting automatically

That usually happens because they were created with a **restart policy** like `restart: always` in your `docker-compose.yml`.

To disable it:

1. Open your `docker-compose.yml`.
2. Look for something like:

   ```yaml
   restart: always
   ```

   or

   ```yaml
   restart: unless-stopped
   ```
3. Change it to:

   ```yaml
   restart: "no"
   ```
4. Recreate the containers:

   ```bash
   sudo docker-compose down
   sudo docker-compose up -d
   ```

---

### 🔹 To stop them **and remove everything** (containers + network + volumes)

⚠️ This will also remove your MongoDB data:

```bash
sudo docker-compose down -v
```

---

```bash
sudo docker images

sudo docker-compose ps
```

