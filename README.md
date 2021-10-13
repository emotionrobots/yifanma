# Example Server

## Introduction

The server runs in an Ubuntu 20.04 cloud server.

## Installation

    npm install
    sudo node server.js &

## Modules Description

server.js - top-level application

globals.js - Global functions and global variables

layer.js - Base class implementing MQTT and HTTP handlers

web.js - Derived from layer to implement web console HTTP API interaction

counter.js - Derived from layer class supporting people counter MQTT interaction
