@echo off
set tempdir=
REM Remove read-only attribute
attrib -R "%tempdir%\*" /S

REM This removes any files in the specified directory that has a modified time older than 30 days (/D 30)
forfiles -p "%tempdir%" -s -m * /D -30 /C "cmd /c del /q @path" 2> nul

REM Remove empty directories
for /f "usebackq delims=" %%d in (`"dir "%tempdir%" /ad/b/s | sort /R"`) do rd "%%d" 2> nul
