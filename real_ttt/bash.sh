sudo docker-compose down -v
sudo docker system prune -f
sudo docker-compose up -d --build
sudo docker-compose ps