@echo off
REM Close the React app (served by serve)
taskkill /F /IM serve.exe /T

REM Close the Express app (run by npm start)
taskkill /F /IM node.exe /T
