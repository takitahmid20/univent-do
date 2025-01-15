#!/usr/bin/env bash
# exit on error
set -o errexit

# Install system dependencies
apt-get update
apt-get install -y \
    python3-dev \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev

# Clear pip cache
pip cache purge
rm -rf /opt/render/project/src/.venv

# Install dependencies
pip install -r requirements.txt

# Make sure the script is executable
chmod +x build.sh