#!/bin/bash
      pm2 delete -s lppApi || :
      pm2 delete -s lpp || :
      pm2 start ./apiBuild/server.js --name=lppApi
      pm2 start ./server.js --name=lpp