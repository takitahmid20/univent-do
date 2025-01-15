#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install python3 python3-pip python3-venv nginx git nodejs npm -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone the repository
cd /root
git clone https://github.com/takitahmid20/univent-do.git
cd univent-do

# Setup Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
pip3 install gunicorn

# Copy systemd service file
sudo cp univent-backend.service /etc/systemd/system/
sudo systemctl enable univent-backend
sudo systemctl start univent-backend

# Setup Frontend
cd ../frontend
npm install
npm run build
npm install -g pm2
pm2 start npm --name "univent-frontend" -- start

# Setup Nginx
sudo cp ../backend/nginx-backend.conf /etc/nginx/sites-available/backend
sudo cp ../frontend/nginx-frontend.conf /etc/nginx/sites-available/frontend
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Install SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx --non-interactive --agree-tos --email your-email@example.com -d 146.190.103.123
