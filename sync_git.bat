@echo off
set GIT_PATH="C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\mingw64\bin\git.exe"
%GIT_PATH% init
%GIT_PATH% add .
%GIT_PATH% commit -m "Initial commit: Task AI with Dynamic/Random tasks and Circular Queue"
%GIT_PATH% remote add origin https://github.com/Cefjulio/task_ai.git
%GIT_PATH% branch -M main
%GIT_PATH% push -u origin main --force
