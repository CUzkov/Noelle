#!/usr/bin/env bash

sudo docker-compose build server

sudo docker-compose up -d

sudo docker system prune -f
